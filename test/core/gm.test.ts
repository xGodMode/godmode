import ganache from 'ganache-core';

import chai from '../utils/chai';
import GMDep = require('../../src/gm.dep');
import { GM } from '../../src/gm';
import { GMError } from '../../src/common/errors';
import Web3 from 'web3';
import { accountIsLocked } from '../utils/eth';

chai.configure();
const { expect } = chai;

let wsHost = 'localhost';
if (process.env.NODE_ENV == 'testing') {
    wsHost = 'docker.for.mac.' + wsHost;
}

const server = ganache.server({
    mnemonic:
        'note flavor live ripple hold salute future drum robot book captain acoustic',
    total_accounts: 10,
    debug: true,
});
const port = 8545;
const provider = `ws://${wsHost}:${port}`;
const network = 'development';
let gm: GM;

describe('gm', () => {
    before(async function () {
        await server.listen(port);
    });
    beforeEach(async function () {
        gm = new GM(network, provider);
    });
    after(async function () {
        await server.close();
    });

    it('should initialize', async () => {
        const currentProvider = gm['web3'].currentProvider;
        expect(gm.network).to.equal(-1);
        expect(gm['currentRequestId']).to.equal(1);
        if (typeof currentProvider !== 'string') {
            if (currentProvider instanceof Web3.providers.WebsocketProvider) {
                expect(currentProvider['url']).to.equal(provider);
            }
        } else {
            expect(currentProvider).to.equal(provider);
        }
    });

    describe('#open()', () => {
        it('should throw when a websocket is not running on the specified provider url', async () => {
            const wrongPort = '1234';
            const gm = new GM('development', `ws://${wsHost}:${wrongPort}`);
            await expect(gm.open()).to.be.rejectedWith(
                GMError,
                'Failed to open websocket'
            );
            await gm.close();
        });
        it('should connect web3 to websocket', async () => {
            await gm.open();
            const currentProvider = gm['web3'].currentProvider;
            if (typeof currentProvider !== 'string') {
                expect(currentProvider.connected).to.be.true;
            }
            await gm.close();
        });
        it('should set tx sender to default web3 account', async function () {
            await gm.open();
            expect(Web3.utils.isAddress(gm['txSender'])).to.be.true;
            expect(gm['txSender']).to.equal(gm['web3'].eth.defaultAccount);
            await gm.close();
        });
    });

    describe('#close()', () => {
        it('should remove websocket listeners', async () => {
            await gm.open();
            await gm.close();
            expect(gm['wsp'].onOpen.hasListeners()).to.be.false;
            expect(gm['wsp'].onError.hasListeners()).to.be.false;
            expect(gm['wsp'].onClose.hasListeners()).to.be.false;
            expect(gm['wsp'].onMessage.hasListeners()).to.be.false;
        });
    });

    describe('#unlockAccount()', () => {
        it('should unlock the given account', async () => {
            await gm.open();
            const password = 'pw';
            const account = await gm['web3'].eth.personal.newAccount(
                password,
                console.log
            );
            await gm['web3'].eth.personal.lockAccount(account, console.log);
            expect(await accountIsLocked(gm['web3'], account)).to.be.true;
            await gm.unlockAccount(account, password);
            expect(await accountIsLocked(gm['web3'], account)).to.be.false;
            await gm.close();
        });
    });
});
