import 'mocha';
import { expect, should } from 'chai';
import Account from '../src/account';

should();

describe('Account', function () {
  describe('#fromString', function () {
    it('should return account', function () {
      const a = Account.fromString('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
      a.getPublicKey().compare(Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
      expect(a.getPrivateKey()).to.be.undefined;
    });
  });
});
