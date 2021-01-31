import { ChainID } from 'caip';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import WebSocket from 'ws';
import WebSocketAsPromised from 'websocket-as-promised';
import { GMError, CAIPNetworkError } from '@xgm/error-codes';

import { TransactionReceipt, TransactionResult } from './common/interfaces';
import { SupportedNetworks } from './common/networks';
import { addPresetProtocols } from './protocols';
import { Protocol, ProtocolNotAvailable } from './protocols/interfaces';

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

    constructor(network: string, provider: any) {
        // TODO: Do we care what kind of providers we accept?
        try {
            this.network = SupportedNetworks[network];
        } catch (error) {
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

        this.currentRequestId = 1;
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
     * @param options { from, args }
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
    ): Promise<boolean> {
        if (!this.web3.utils.isAddress(address)) {
            throw GMError({
                baseError: new TypeError(),
                message: 'Invalid address',
            });
        }

        const contract = new this.web3.eth.Contract(abi, address);

        options.from = options.from || this.txSender;

        return await this._execute(
            address,
            contract,
            runtimeBytecode,
            method,
            options.from,
            options.args
        );
    }

    private async _openWebsocket(): Promise<Event> {
        try {
            this.wsp = new WebSocketAsPromised(this.provider, {
                createWebSocket: (url: string) => {
                    return new WebSocket(url);
                },
                packMessage: (data: any) => JSON.stringify(data),
                unpackMessage: (data: string) => JSON.parse(data),
                attachRequestId: (data: any, requestId: string | number) => {
                    return Object.assign({ id: requestId }, data);
                },
                extractRequestId: (data: any) => data && data.id,
                extractMessageData: (event: any) => event,
            });

            this.wsp.onOpen.addListener((event) => console.log(event));
            this.wsp.onError.addListener((event) => console.error(event));
            this.wsp.onClose.addListener((event) => console.log(event));
            // TODO: Do this in debug mode?
            // this.wsp.onMessage.addListener((message) => console.log(message));

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
        address: string,
        replacementContract: any,
        replacementRuntimeBytecode: string,
        method: string,
        from: string,
        args: Array<any>
    ): Promise<boolean> {
        let originalRuntimeBytecode = await this.web3.eth.getCode(address);
        originalRuntimeBytecode = originalRuntimeBytecode.substring(2);
        // TODO: Change godmode-ganache to to have to remove 0x here
        await this._putBytecode(
            address.substring(2),
            replacementRuntimeBytecode
        );
        const tx = replacementContract.methods[method](...args);
        const response: TransactionReceipt = await tx.send({ from });
        await this._putBytecode(address.substring(2), originalRuntimeBytecode);
        return response.status;
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
