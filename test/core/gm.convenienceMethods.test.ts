import ganache from 'ganache-core';

import chai from '../utils/chai';
import GMDep = require('../../src/gm.dep');
import { GM } from '../../src/gm';

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

describe('gm convenience methods', () => {
    before(async function () {
        await server.listen(port);
    });
    beforeEach(async function () {
        gm = new GM(network, provider);
    });
    after(async function () {
        await server.close();
    });

    describe('gm.mintDai()', () => {
        it('should execute', async () => {
            await gm.open();
            const success = await gm.mintDai(gm.txSender, 100);
            expect(success).to.be.true;
            await gm.close();
        });
    });
});
