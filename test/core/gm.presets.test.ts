import ganache from 'ganache-core';

import { GM } from '../../src/gm';
import GMDep = require('../../src/gm.dep');

import chai from '../utils/chai';

chai.configure();
const { expect } = chai;

let wsHost = 'localhost';
if (process.env.NODE_ENV == 'testing') {
    wsHost = 'docker.for.mac.' + wsHost;
}

// TODO: Move this to a fixture
const server = ganache.server({
    mnemonic:
        'note flavor live ripple hold salute future drum robot book captain acoustic',
    total_accounts: 10,
    debug: true,
    // fork: 'https://mainnet.infura.io/v3/d3bba18279ec4d7290b7af67158f804d',
    // fork: <infura-mainnet-url>
});
const port = 8545;
const provider = `ws://${wsHost}:${port}`;
const network = 'ethereum:mainnet';
let gm: GM;

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

    describe('gm.mintDai()', () => {
        it('should execute', async () => {
            const receipt = await gm.Maker.mintDai(gm.txSender, 100);
            expect(receipt.status).to.be.true;
        });
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
});
