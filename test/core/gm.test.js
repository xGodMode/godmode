const chai = require('chai');
chai.use(require('chai-as-promised'));

const GM = require('../../src/gm');
const GMError = require('../../src/common/errors');

const expect = chai.expect;

describe('gm', function () {
  describe('#open()', function () {
    it('should throw when ganache can not be reached', async function () {
      const falsePort = '1234';
      const gm = new GM('development', `ws://localhost:${falsePort}`);
      await expect(gm.open()).to.be.rejectedWith(GMError, 'Failed to open');
    });
  });
});
