import dotenv from 'dotenv';
dotenv.config();
import { ChainID } from 'caip';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import WebSocket from 'ws';
import WebSocketAsPromised from 'websocket-as-promised';
import { GMError, CAIPNetworkError } from '@xgm/error-codes';

import {
    GodModeWsUrl,
    TransactionReceipt,
    TransactionResult,
} from './common/interfaces';
import { SupportedNetworks } from './common/networks';
import { chop0x } from './common/utils';
import { addPresetProtocols } from './protocols';
import { Protocol, ProtocolNotAvailable } from './protocols/interfaces';

// TODO: Clean this up into proper config for log levels
const DEBUG = process.env.DEBUG == 'true';

export class GM {
    public readonly network: ChainID;
    public readonly provider: string;
    public txSender: string;

    public Compound: Protocol | ProtocolNotAvailable;
    public Maker: Protocol | ProtocolNotAvailable;
    public UniswapV2: Protocol | ProtocolNotAvailable;

    private web3: Web3;
    private wsp: WebSocketAsPromised;
    private currentRequestId: number;
    private accounts: Array<string>;

    constructor(network: string, provider: GodModeWsUrl) {
        this.network = SupportedNetworks[network];
        if (!this.network) {
            throw CAIPNetworkError({
                message: `Unsupported network (${network}). Must be one of ${Object.keys(
                    SupportedNetworks
                )}`,
            });
        }

        this.provider = provider;
        try {
            this.web3 = new Web3(provider);
        } catch (error) {
            throw GMError({
                baseError: error,
                message: 'Failed to initialize web3',
            });
        }

        addPresetProtocols(this);

        this.currentRequestId = new Date().getTime();
    }

    public async open(): Promise<void> {
        await this._openWebsocket();
        await this._setInitialAccounts();
        await this._setTxSender();
    }

    public async close(): Promise<void> {
        const closing = this.wsp.close();
        this.wsp.removeAllListeners();
        await closing;
    }

    public async ping(): Promise<boolean> {
        const response = await this._sendRPCRequest('godmode_debug', ['pong']);
        return response.result == 'pong';
    }

    public async unlockAccount(account: string): Promise<any> {
        return await this._sendRPCRequest('godmode_unlockAccount', [account]);
    }

    /**
     * Returns true if transaction executed successfully
     * @param address Contract address
     * @param abi GM contract ABI
     * @param runtimeBytecode GM contract runtime bytecode
     * @param method Contract method to call
     * @param options {obj} {from, args}
     */
    public async execute(
        address: string,
        abi: AbiItem[],
        runtimeBytecode: string,
        method: string,
        options?: {
            from?: string;
            args?: any[];
        }
    ): Promise<TransactionReceipt | TransactionResult> {
        if (!this.web3.utils.isAddress(address)) {
            throw GMError({
                baseError: new TypeError(),
                message: 'Invalid address',
            });
        }

        const abiItem = abi.find((item) => item.name == method);
        const call = abiItem.constant;

        const contract = new this.web3.eth.Contract(abi, address);

        options.from = options.from || this.txSender;

        return await this._execute(
            call,
            address,
            contract,
            runtimeBytecode,
            method,
            options.from,
            options.args || []
        );
    }

    private async _openWebsocket(): Promise<Event> {
        try {
            this.wsp = new WebSocketAsPromised(this.provider, {
                createWebSocket: (url: string) => {
                    return new WebSocket(url);
                },
                packMessage: (data: any) => JSON.stringify(data),
                unpackMessage: (data: any) => JSON.parse(data),
                attachRequestId: (data: any, requestId: string | number) => {
                    return Object.assign({ id: requestId }, data);
                },
                extractRequestId: (data: any) => data && data.id,
                extractMessageData: (data: any) => data,
            });

            // TODO: Add logger with log level
            this.wsp.onError.addListener((error: Error) =>
                console.error('WebSocket error:', error)
            );
            this.wsp.onClose.addListener((code: number) =>
                console.warn('WebSocket close:', code)
            );
            if (DEBUG) {
                this.wsp.onOpen.addListener(() =>
                    console.log('WebSocket open')
                );
                this.wsp.onMessage.addListener((message) =>
                    console.log('WebSocket message:', message)
                );
            }

            return await this.wsp.open();
        } catch (error) {
            await this.wsp.close();
            throw GMError({
                baseError: error,
                message: 'Failed to open websocket',
            });
        }
    }

    private async _setInitialAccounts(): Promise<void> {
        try {
            this.accounts = await this.web3.eth.personal.getAccounts();
        } catch (error) {
            throw GMError({
                baseError: error,
                message: 'Failed to set accounts',
            });
        }
    }

    private async _setTxSender(): Promise<void> {
        const txSender = this.accounts[0];
        try {
            if (typeof txSender === 'string' && txSender != '') {
                this.txSender = txSender;
                this.web3.eth.defaultAccount = txSender;
            } else {
                throw Error(`"${txSender}" is not valid for txSender`);
            }
        } catch (error) {
            throw GMError({
                baseError: error,
                message: 'Failed to set txSender',
            });
        }
    }

    private async _execute(
        call: boolean,
        address: string,
        replacementContract: any,
        replacementRuntimeBytecode: string,
        method: string,
        from: string,
        args: Array<any>
    ): Promise<TransactionReceipt | TransactionResult> {
        const addressChopped = chop0x(address);
        const replacementRuntimeBytecodeChopped = chop0x(
            replacementRuntimeBytecode
        );

        const originalRuntimeBytecodeChopped = chop0x(
            await this.web3.eth.getCode(address)
        );

        await this._putBytecode(
            addressChopped,
            replacementRuntimeBytecodeChopped
        );
        const tx = replacementContract.methods[method](...args);

        let output: any;
        if (call) {
            output = (await tx.call({ from })) as TransactionResult;
        } else {
            output = (await tx.send({ from })) as TransactionReceipt;
        }

        await this._putBytecode(addressChopped, originalRuntimeBytecodeChopped);
        return output;
    }

    private async _putBytecode(
        address: string,
        bytecode: string
    ): Promise<void> {
        await this._sendRPCRequest('godmode_putContractCode', [
            address,
            bytecode,
        ]);
    }

    private async _sendRPCRequest(
        method: string,
        params: Array<string>
    ): Promise<any> {
        const currentRequestId = this.currentRequestId;
        this.currentRequestId++;

        if (!this.wsp) {
            throw GMError({ message: 'Websocket is not open' });
        }

        return this.wsp.sendRequest(
            {
                jsonrpc: '2.0',
                method,
                params,
            },
            { requestId: currentRequestId }
        );
    }
}
