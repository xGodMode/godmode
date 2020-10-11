const WebSocketAsPromised = require('websocket-as-promised');
const WebSocket = require('ws');
const Web3 = require('web3');

const { GMError } = require('./common/errors');

const CompoundCERC20 = require('../build/contracts/CErc20.json');
const GMDai = require('../gmContractsInfo/gmDai.js');
const GMUniswapV2Factory = require('../build/contracts/UniswapV2Factory.json');
const GMUniswapV2Pair = require('../build/contracts/UniswapV2Pair.json');

enum EthereumNetwork {
    mainnet = 1,
    ropsten = 3,
    rinkeby = 4,
    kovan = 42,
    development = -1,
}

export class GM {
    public network: EthereumNetwork;

    private web3: any;
    private currentRequestId: number;

    constructor(network: string, provider: string) {
        this.network = EthereumNetwork[network];

        this.web3 = new Web3(provider);

        this.currentRequestId = 1;

        if (this.network != EthereumNetwork.development) {
            // get correct address based on network
        }
    }
}
