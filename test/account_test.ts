import { should } from 'chai';
import Account from '../src/account';
import { PUBLIC_KEY_LENGTH, PRIVATE_KEY_LENGTH } from '../src/constants';
import { create } from 'domain';

should();

describe('Account', function () {
  describe('#contructor', function () {
    context('valid public key', function () {
      it('should return account', function () {
        const a = new Account(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex'));
        a.publicKey.compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey.should.be.false;
      });
    });

    context('valid private key', function () {
      it('should return account', function () {
        const a = new Account(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex'));
        a.publicKey.compare(Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
        a.privateKey.compare(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
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
        a.publicKey.compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey.should.be.false;
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
        a.publicKey.compare(Buffer.from('072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348', 'hex')).should.equal(0);
        a.hasPrivateKey.should.be.false;
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
        a.publicKey.compare(Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
        a.privateKey.compare(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex')).should.equal(0);
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
      a.publicKey.length.should.equal(PUBLIC_KEY_LENGTH);
      a.privateKey.length.should.equal(PRIVATE_KEY_LENGTH);
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
      a.address.compare(Buffer.from('58072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb', 'hex')).should.equal(0);
    });
  });

  describe('#sign', function () {
    context('has private key', function () {
      it('should return valid signature', function () {
        const privateKey = Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16dcfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex');
        const signature = Buffer.from('b0e049210d3377772083c9c2e0389f1e64b9a2f23a7bbebc0ed91d22b1af49cd036c3878a2495d4972be840b6b708b339f4849dbe0478283222e9209df481d0b', 'hex');
        const a = new Account(privateKey);
        const data = Buffer.from('hello world', 'utf8');
        a.sign(data).compare(signature).should.equal(0);
      });
    });

    context('missing private key', function () {
      it('should throw error', function () {
        const publicKey = Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        (function () {
          a.sign(data);
        }).should.throw(Error);
      });
    });
  });

  describe('#verify', function () {
    context('valid signature', function () {
      it('should return true', function () {
        const publicKey = Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex');
        const signature = Buffer.from('b0e049210d3377772083c9c2e0389f1e64b9a2f23a7bbebc0ed91d22b1af49cd036c3878a2495d4972be840b6b708b339f4849dbe0478283222e9209df481d0b', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        a.verify(data, signature).should.be.true;
      });
    });

    context('invalid signature size', function () {
      it('should throw error', function () {
        const publicKey = Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex');
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
        const publicKey = Buffer.from('cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe3', 'hex');
        const signature = Buffer.from('bae049210d3377772083c9c2e0389f1e64b9a2f23a7bbebc0ed91d22b1af49cd036c3878a2495d4972be840b6b708b339f4849dbe0478283222e9209df481d0b', 'hex');
        const a = new Account(publicKey);
        const data = Buffer.from('hello world', 'utf8');
        a.verify(data, signature).should.be.false;
      });
    });
  });
  
  describe('#create', function () {
    context('nonce 0', function () {
      it('should return generate address', function () {
        Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex'))
          .create(0)
          .toString().should.equal('LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS');
      });
    });
    context('nonce 1', function () {
      it('should return generate address', function () {
        Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex'))
          .create(1)
          .toString().should.equal('LCPML46ZM36URNZZYESDE5KSBP44L7MPXJMK2WBHGXITKB6LWUCSAQGR');
      });
    });
  });
});
