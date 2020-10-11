import chai from '../utils/chai';

chai.configure();
const { expect } = chai;

import GM = require('../../src/gm');
import { GMError } from '../../src/common/errors';

describe('gm', function () {
    describe('#open()', function () {
        it('should throw when ganache can not be reached', async function () {
            const falsePort = '1234';
            const gm = new GM('development', `ws://localhost:${falsePort}`);
            await expect(gm.open()).to.be.rejectedWith(
                GMError,
                'Failed to open',
            );
        });
    });
});
