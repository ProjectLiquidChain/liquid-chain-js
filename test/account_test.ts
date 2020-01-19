import { expect, should } from 'chai';
import Account from '../src/account';
import { PUBLIC_KEY_LENGTH, PRIVATE_KEY_LENGTH } from '../src/constants';

should();

describe('Account', function () {
  describe('#contructor', function () {
    context('valid public key', function () {
      it('should return account', function () {
        const a = new Account(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex'));
        a.getPublicKey().compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey().should.be.false;
      });
    });

    context('valid private key', function () {
      it('should return account', function () {
        const a = new Account(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex'));
        a.getPublicKey().compare(Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
        a.getPrivateKey().compare(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
      });
    });

    context('invalid key', function () {
      it('should throw error', function () {
        (function () {
          new Account(Buffer.from('abcd', 'hex'));
        }).should.throw(Error);
      });
    });
  });

  describe('#fromString', function () {
    context('valid', function () {
      it('should return account', function () {
        const a = Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        a.getPublicKey().compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey().should.be.false;
      });
    });

    context('invalid base32', function () {
      it('should throw error', function () {
        (function () {
          Account.fromString('LADabc');
        }).should.throw(Error);
      });
    });

    context('invalid version', function () {
      it('should throw error', function () {
        (function () {
          Account.fromString('BADXUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        }).should.throw(Error);
      });
    });

    context('invalid checksum', function () {
      it('should throw error', function () {
        (function () {
          Account.fromString('BADXUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        }).should.throw(Error);
      });
    });
  });

  describe('#fromAddress', function () {
    context('valid', function () {
      it('should return account', function () {
        const a = Account.fromAddress(Buffer.from('58072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb', 'hex'));
        a.getPublicKey().compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey().should.be.false;
      });
    });

    context('invalid', function () {
      it('should throw error', function () {
        (function () {
          Account.fromAddress(Buffer.from('ab072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb', 'hex'));
        }).should.throw(Error);
      });
    });
  });

  describe('#fromSeed', function () {
    context('valid', function () {
      it('should return account', function () {
        const a = Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex'));
        a.getPublicKey().compare(Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
        a.getPrivateKey().compare(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
      });
    });

    context('invalid', function () {
      it('should throw error', function () {
        (function () {
          Account.fromSeed(Buffer.from('abcd', 'hex'));
        }).should.throw(Error);
      });
    });
  });

  describe('#generate', function () {
    it('should return account', function () {
      const a = Account.generate();
      a.getPublicKey().length.should.equal(PUBLIC_KEY_LENGTH);
      a.getPrivateKey().length.should.equal(PRIVATE_KEY_LENGTH);
    })
  });

  describe('#toString', function () {
    it('should return base32 address with L prefix', function () {
      const a = new Account(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex'));
      a.toString().should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
    });
  });

  describe('#getAddress', function () {
    it('should return 35 bytes address', function () {
      const a = new Account(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex'));
      a.getAddress().compare(Buffer.from('58072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb', 'hex')).should.equal(0);
    });
  });

  // proof from stellar-base
  describe('#sign', function () {
    context('has private key', function () {
      it('should return valid signature', function () {
        const privateKey = Buffer.from('1123740522f11bfef6b3671f51e159ccf589ccf8965262dd5f97d1721d383dd4ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437', 'hex');
        const signature = Buffer.from('587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309', 'hex');
        const a = new Account(privateKey);
        const data = Buffer.from('hello world', 'utf8');
        a.sign(data).compare(signature).should.equal(0);
      });
    });

    context('missing private key', function () {
      it('should throw error', function () {
        const publicKey = Buffer.from('ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        (function () {
          a.sign(data);
        }).should.throw(Error);
      });
    });
  });

  // proof from stellar-base
  describe('#verify', function () {
    context('valid signature', function () {
      it('should return true', function () {
        const publicKey = Buffer.from('ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437', 'hex');
        const signature = Buffer.from('587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        a.verify(data, signature).should.be.true;
      });
    });

    context('invalid signature size', function () {
      it('should throw error', function () {
        const publicKey = Buffer.from('ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437', 'hex');
        const signature = Buffer.from('abcd', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        (function () {
          a.verify(data, signature);
        }).should.throw(Error);
      });
    });

    context('invalid signature', function () {
      it('should return false', function () {
        const publicKey = Buffer.from('ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437', 'hex');
        const signature = Buffer.from('ab7d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        a.verify(data, signature).should.be.false;
      });
    });
  });
});
