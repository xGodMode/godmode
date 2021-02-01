import { GM } from '../src/gm';
import GMDep = require('../src/gm.dep');

import { ganacheServer } from './fixtures/ganacheServer';
import chai from './utils/chai';

chai.configure();
const { expect } = chai;

let wsHost = 'localhost';
if (process.env.NODE_ENV == 'testing') {
    wsHost = 'docker.for.mac.' + wsHost;
}

const port = 8545;
const provider = `ws://${wsHost}:${port}`;
const network = 'ethereum:mainnet';
let gm: GM;

const fork = process.env.INFURA_MAINNET_URL;
const server = ganacheServer(fork);

describe('gm preset methods', () => {
    before(async function () {
        await server.listen(port);
        gm = new GM(network, provider); // chain state will be shared between tests
    });
    beforeEach(async function () {
        await gm.open();
    });
    afterEach(async function () {
        await gm.close();
    });
    after(async function () {
        await server.close();
    });
    describe('gm.Compound.mintCErc20()', () => {
        it('should give CTokens to account', async () => {
            const from = gm.txSender;
            const mainnetCBAT = '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e';
            const startBalance = await gm.execute(
                mainnetCBAT,
                gm.Compound['gmCErc20'].abi,
                gm.Compound['gmCErc20'].runtimeBytecode,
                'balanceOf',
                { from, args: [from] }
            );
            await gm.Compound.mintCErc20(mainnetCBAT, gm.txSender, 100);
            const endBalance = await gm.execute(
                mainnetCBAT,
                gm.Compound['gmCErc20'].abi,
                gm.Compound['gmCErc20'].runtimeBytecode,
                'balanceOf',
                { from, args: [from] }
            );
            expect(Number(endBalance) - Number(startBalance)).to.equal(100);
        });
    });
    describe('gm.Maker.mintDai()', () => {
        it('should give Dai to account', async () => {
            const from = gm.txSender;
            const startBalance = await gm.execute(
                gm.Maker.getAddress('Dai'),
                gm.Maker['gmDai'].abi,
                gm.Maker['gmDai'].runtimeBytecode,
                'balanceOf',
                { from, args: [from] }
            );
            await gm.Maker.mintDai(gm.txSender, 100);
            const endBalance = await gm.execute(
                gm.Maker.getAddress('Dai'),
                gm.Maker['gmDai'].abi,
                gm.Maker['gmDai'].runtimeBytecode,
                'balanceOf',
                { from, args: [from] }
            );
            expect(Number(endBalance) - Number(startBalance)).to.equal(100);
        });
    });
    describe('gm.UniswapV2.Factory_setFeeTo()', () => {
        it('should replace the feeTo account', async () => {
            const from = gm.txSender;
            const startFeeTo = await gm.execute(
                gm.UniswapV2.getAddress('UniswapV2Factory'),
                gm.UniswapV2['gmUniswapV2Factory'].abi,
                gm.UniswapV2['gmUniswapV2Factory'].runtimeBytecode,
                'feeTo',
                { from, args: [] }
            );
            expect(startFeeTo).to.not.equal(from);
            await gm.UniswapV2.Factory_setFeeTo(gm.txSender);
            const endFeeTo = await gm.execute(
                gm.UniswapV2.getAddress('UniswapV2Factory'),
                gm.UniswapV2['gmUniswapV2Factory'].abi,
                gm.UniswapV2['gmUniswapV2Factory'].runtimeBytecode,
                'feeTo',
                { from, args: [] }
            );
            expect(endFeeTo).to.equal(from);
        });
    });
    describe('gm.UniswapV2.Pair_setKLast()', () => {
        const gamestopToken = '0x9eb6be354d88fd88795a04de899a57a77c545590';
        const weth9 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        const pairAddress = '0x806e128FAEa66172E77CEB86821E0a1FCAf5A669';
        it('should replace kLast for the pair', async () => {
            const from = gm.txSender;
            const kLast = '12';
            const start = await gm.execute(
                pairAddress,
                gm.UniswapV2['gmUniswapV2Pair'].abi,
                gm.UniswapV2['gmUniswapV2Pair'].runtimeBytecode,
                'kLast',
                { from, args: [] }
            );
            expect(start).to.not.equal(kLast);
            await gm.UniswapV2.Pair_setKLast(pairAddress, kLast);
            const end = await gm.execute(
                pairAddress,
                gm.UniswapV2['gmUniswapV2Pair'].abi,
                gm.UniswapV2['gmUniswapV2Pair'].runtimeBytecode,
                'kLast',
                { from, args: [] }
            );
            expect(end).to.equal(kLast);
        });
    });
});
