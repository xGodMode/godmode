import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { TransactionReceipt } from 'web3-core';
import WebSocket from 'ws';
import WebSocketAsPromised from 'websocket-as-promised';

import { GMError } from './common/errors';

enum EthereumNetwork {
    mainnet = 1,
    ropsten = 3,
    rinkeby = 4,
    kovan = 42,
    development = -1,
}

export class GM {
    public readonly network: EthereumNetwork;
    public readonly provider: string;
    public txSender: string;

    private web3: Web3;
    private wsp: WebSocketAsPromised;
    private currentRequestId: number;
    private accounts: Array<string>;

    constructor(network: string, provider: any) {
        // TODO: Do we care what kind of providers we accept?
        this.network = EthereumNetwork[network];
        this.provider = provider;
        try {
            this.web3 = new Web3(provider);
        } catch (error) {
            throw new GMError(error, 'Failed to initialize web3');
        }

        this.currentRequestId = 1;

        if (this.network != EthereumNetwork.development) {
            // TODO: Get correct contract addresses based on network
        }
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

    public async unlockAccount(account: string): Promise<any> {
        return await this._sendRPCRequest('godmode_unlockAccount', [account]);
    }

    /**
     * Returns true if transaction executed successfully
     * @param address Contract address
     * @param method Contract method to call
     * @param abi ABI of GM contract
     * @param bytecode Runtime bytecode of GM contract
     * @param from Address of tx sender
     * @param args Contract method arguments
     */
    public async execute(
        address: string,
        method: string,
        abi: AbiItem[],
        bytecode: string,
        from: string = this.txSender,
        args?: any[]
    ): Promise<boolean> {
        if (!this.web3.utils.isAddress(address))
            throw new GMError(TypeError('Invalid address'));
        const contract = new this.web3.eth.Contract(abi, address);
        return await this._execute(
            address,
            contract,
            bytecode,
            method,
            from,
            args
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
            throw new GMError(error, 'Failed to open websocket');
        }
    }

    private async _setInitialAccounts(): Promise<void> {
        try {
            this.accounts = await this.web3.eth.personal.getAccounts();
        } catch (error) {
            throw new GMError(error, 'Failed to set accounts');
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
            throw new GMError(error, 'Failed to set txSender');
        }
    }

    private async _execute(
        address: string,
        replacementContract: any,
        replacementRuntimeBytecode: string,
        method: string,
        from: string,
        args: Array<any>
    ): Promise<any> {
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
        const response = await this._sendRPCRequest('godmode_putContractCode', [
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
