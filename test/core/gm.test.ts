import ganache from 'ganache-core';
import Web3 from 'web3';
import { GMError } from '@xgm/error-codes';

import chai from '../utils/chai';
import GMDep = require('../../src/gm.dep');
import { GM } from '../../src/gm';
import contracts from '../../src/common/contracts';
import { accountIsLocked } from '../utils/eth';
import { ChainID } from 'caip';

const { GMDai } = contracts;
const GMDaiAbi = GMDai.contracts['GMDai.sol'].GMDai.abi;
const GMDaiBytecode =
    GMDai.contracts['GMDai.sol'].GMDai.evm.deployedBytecode.object;
const DaiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

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
    // fork: <infura-mainnet-url>
});
const port = 8545;
const provider = `ws://${wsHost}:${port}`;
const network = 'dev';
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
        expect(gm.network.toString()).to.equal('000:0');
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

    describe.only('#ping()', () => {
        it('should return true if a pong response was sent', async () => {
            await gm.open();
            expect(await gm.ping()).to.be.true;
            await gm.close();
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
            await gm.unlockAccount(account);
            expect(await accountIsLocked(gm['web3'], account)).to.be.false;
            await gm.close();
        });
    });

    describe('#execute()', () => {
        it('should execute', async () => {
            await gm.open();
            const method = 'mint';
            const from = gm.txSender;
            const args = [from, 100];
            const success = await gm.execute(
                DaiAddress,
                method,
                GMDaiAbi,
                GMDaiBytecode,
                from,
                args
            );
            expect(success).to.be.true;
            // TODO: test the balance
            await gm.close();
        });
    });
});
