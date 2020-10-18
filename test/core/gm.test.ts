import chai from '../utils/chai';

import GMDep = require('../../src/gm.dep');
import { GM } from '../../src/gm';
import { GMError } from '../../src/common/errors';
import Web3 from 'web3';

chai.configure();
const { expect } = chai;

// TODO: run tests with mocked ws

describe('gm', () => {
    it('should initialize', async () => {
        const network = 'development';
        const provider = 'ws://localhost:8545';
        const gm = new GM(network, provider);
        expect(gm.network).to.equal(-1);
        expect(gm['currentRequestId']).to.equal(1);
        expect(gm['web3'].currentProvider.toString()).to.equal(provider);
    });

    describe('#open()', () => {
        it('should throw when a websocket is not running on the specified provider url', async () => {
            const falsePort = '1234';
            const gm = new GM('development', `ws://localhost:${falsePort}`);
            await expect(gm.open()).to.be.rejectedWith(
                GMError,
                'Failed to open websocket'
            );
        });
    });

    describe('#close()', () => {
        it('should remove websocket listeners', async () => {
            const network = 'development';
            const provider = 'ws://localhost:8545';
            const gm = new GM(network, provider);
            try {
                await gm.open();
            } catch (error) {
                // ignore
            }
            await gm.close();
            // TODO: Is there a way to check all at once?
            expect(gm['wsp'].onOpen.hasListeners()).to.be.false;
            expect(gm['wsp'].onError.hasListeners()).to.be.false;
            expect(gm['wsp'].onClose.hasListeners()).to.be.false;
            expect(gm['wsp'].onMessage.hasListeners()).to.be.false;
        });
    });
});
