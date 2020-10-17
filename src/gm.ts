import Web3 from 'web3';
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

    constructor(network: string, provider: string) {
        this.network = EthereumNetwork[network];
        this.provider = provider;
        try {
            this.web3 = new Web3(provider);
        } catch (error) {
            throw new GMError(error, 'Failed');
        }

        this.currentRequestId = 1;

        if (this.network != EthereumNetwork.development) {
            // get correct address based on network
        }
    }

    public async open(): Promise<void> {
        await this._openWebsocket();
        await this._setTxSender();
    }

    public async close(): Promise<void> {
        const closing = this.wsp.close();
        this.wsp.removeAllListeners();
        await closing;
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
            this.wsp.onMessage.addListener((message) => console.log(message));

            return await this.wsp.open();
        } catch (error) {
            await this.wsp.close();
            throw new GMError(error, 'Failed to open websocket');
        }
    }

    private async _setTxSender(): Promise<void> {
        try {
            this.txSender = await this.web3.eth.personal.getAccounts()[0];
        } catch (error) {
            throw new GMError(error, 'Failed to set txSender');
        }
    }
}
