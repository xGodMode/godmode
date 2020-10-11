import chai from '../utils/chai';

chai.configure();
const { expect } = chai;

import GMDep = require('../../src/gm.dep');
import { GM } from '../../src/gm';
import { GMError } from '../../src/common/errors';

describe('gm', function () {
    it('should initialize', async function () {
        const network = 'development';
        const provider = 'ws://localhost:8545';
        const gm = new GM(network, provider);
        expect(gm.network).to.equal(-1);
        expect(gm['currentRequestId']).to.equal(1);
        expect(gm['web3'].currentProvider.url).to.equal(provider);
    });

    describe('#open()', function () {
        it('should throw when ganache can not be reached', async function () {
            const falsePort = '1234';
            const gm = new GMDep('development', `ws://localhost:${falsePort}`);
            await expect(gm.open()).to.be.rejectedWith(
                GMError,
                'Failed to open',
            );
        });
    });
});
