import { should, expect } from 'chai';
import Transaction from '../src/transaction';
import Account from '../src/account';

should();

const TRANSACTION_VERSION = 1;

describe('Transaction', function () {
  describe('#constructor', function () {
    context('with to address', function () {
      it('should create', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.signatureHash
          .compare(Buffer.from('c8f0d929b4484aa3ce52c6187900f71f443e6f285f502f36e0dd68d64104909b', 'hex'))
          .should.equal(0);
      });
    });

    context('without to address', function () {
      it('should create', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.signatureHash
          .compare(Buffer.from('760d35919b3f1f4f0688e1c84bb449b67fcfb8af179157f436632d4e3ebcb4ef', 'hex'))
          .should.equal(0);
      });
    });

    context('with signature', function () {
      it('should create', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('2740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex'),
        });
        tx.signatureHash
          .compare(Buffer.from('c8f0d929b4484aa3ce52c6187900f71f443e6f285f502f36e0dd68d64104909b', 'hex'))
          .should.equal(0);
      });
    });
  });

  describe('#toBuffer', function () {
    context('with signature', function () {
      it('should return binary', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.sign();
        tx.toBuffer()
          .compare(Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c648201c8830186a0b8402740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex'))
          .should.equal(0);
        tx.hash.should.equal('5bfad3ce3468bb7400f81416ac663bf5e7f12f87b40931cb6d6408f0a7064a33');
      });
    });
    context('without signature', function () {
      it('should return binary', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.toBuffer()
          .compare(Buffer.from('f86601e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c648201c8830186a0', 'hex'))
          .should.equal(0);
      });
    });
  });

  describe('#sign', function () {
    it('should create signature', function () {
      const tx = new Transaction({
        version: TRANSACTION_VERSION,
        from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
        nonce: 123,
        to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
        payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
        gasPrice: 456,
        gasLimit: 100000,
      });
      tx.sign()
        .compare(Buffer.from('2740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex'))
        .should.equal(0);
    });

    context('invalid signature size', function () {
      it('should throw error', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        (function () {
          tx.sign(Buffer.from('abcd', 'hex'));
        }).should.throw(Error);
      });
    });

    context('invalid signature', function () {
      it('should throw error', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        (function () {
          tx.sign(Buffer.from('ab2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'));
        }).should.throw(Error);
      });
    });
  });

  describe('#toJSON', function () {
    context('full', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('2740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          version: TRANSACTION_VERSION,
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: 456,
          gasLimit: 100000,
          signature: '2740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905',
        });
      });
    });
    
    context('without signature', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
        });
        const json = tx.toJSON();
        json.should.eql({
          version: TRANSACTION_VERSION,
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: 456,
          gasLimit: 100000,
          signature: null,
        });
      });
    });

    context('without to address', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          version: TRANSACTION_VERSION,
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          payload: [Buffer.from('test'), Buffer.from('args'), Buffer.from('hello world')],
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('c4debb8c16123d94ef88743f6582c1293abb6b3ad5ba024af2670805c761974d1660c913ce3a285d5a7c946fe41b94ac107c4d615b6b50fac133383cae34720e', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          version: TRANSACTION_VERSION,
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: null,
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: 456,
          gasLimit: 100000,
          signature: 'c4debb8c16123d94ef88743f6582c1293abb6b3ad5ba024af2670805c761974d1660c913ce3a285d5a7c946fe41b94ac107c4d615b6b50fac133383cae34720e',
        });
      });
    });
  });

  describe('#fromBuffer', function() {
    context('full', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c648201c8830186a0b8402740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        tx.signature!.compare(Buffer.from('2740752de8c91e53677f26d99bb6a173dc3c75f2330d11b52fc954e1416effc6275348f1b47e2509fabf187902525c759351a687987e4a3e78bc05f12279b905', 'hex')).should.equal(0);
        tx.to!.toString().should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        tx.payload[0]!.compare(Buffer.from('test')).should.equal(0);
        tx.payload[1]!.compare(Buffer.from('args')).should.equal(0);
        tx.payload[2]!.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });

    context('without signature', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f86601e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c648201c8830186a0', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        expect(tx.signature).to.be.null;
        tx.to!.toString().should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        tx.payload[0]!.compare(Buffer.from('test')).should.equal(0);
        tx.payload[1]!.compare(Buffer.from('args')).should.equal(0);
        tx.payload[2]!.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });

    context('without to address', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba30000000000000000000000000000000000000000000000000000000000000000000000d6847465737484617267738b68656c6c6f20776f726c648201c8830186a0b840c4debb8c16123d94ef88743f6582c1293abb6b3ad5ba024af2670805c761974d1660c913ce3a285d5a7c946fe41b94ac107c4d615b6b50fac133383cae34720e', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        tx.signature!.compare(Buffer.from('c4debb8c16123d94ef88743f6582c1293abb6b3ad5ba024af2670805c761974d1660c913ce3a285d5a7c946fe41b94ac107c4d615b6b50fac133383cae34720e', 'hex')).should.equal(0);
        expect(tx.to).to.be.null;
        tx.payload[0]!.compare(Buffer.from('test')).should.equal(0);
        tx.payload[1]!.compare(Buffer.from('args')).should.equal(0);
        tx.payload[2]!.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });
  });
});
