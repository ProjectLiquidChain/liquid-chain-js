import { should, expect } from 'chai';
import Transaction from '../src/transaction';
import Account from '../src/account';

should();

describe('Transaction', function () {
  describe('#constructor', function () {
    context('with to address', function () {
      it('should create', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.signatureHash
          .compare(Buffer.from('5b5675c8db9c95c3de23ccc6583bde5f15f48437b6095db9161df429c987dfda', 'hex'))
          .should.equal(0);
      });
    });

    context('without to address', function () {
      it('should create', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.signatureHash
          .compare(Buffer.from('79c9381076d509082acf3873e3c09e9986f60b8abd16fe097d5d2ee362dd78a2', 'hex'))
          .should.equal(0);
      });
    });

    context('with signature', function () {
      it('should create', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'),
        });
        tx.signatureHash
          .compare(Buffer.from('5b5675c8db9c95c3de23ccc6583bde5f15f48437b6095db9161df429c987dfda', 'hex'))
          .should.equal(0);
      });
    });
  });

  describe('#toBuffer', function () {
    context('with signature', function () {
      it('should return binary', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.sign();
        tx.toBuffer()
          .compare(Buffer.from('f89df864a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37bb840ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b8b68656c6c6f20776f726c64a358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb830186a08201c8', 'hex'))
          .should.equal(0);
      });
    });

    context('without signature', function () {
      it('should return binary', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        tx.toBuffer(false)
          .compare(Buffer.from('f85be3a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37b808b68656c6c6f20776f726c64a358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb830186a08201c8', 'hex'))
          .should.equal(0);
      });
    });
  });

  describe('#setSignature', function () {
    context('invalid signature size', function () {
      it('should throw error', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
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
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        (function () {
          tx.sign(Buffer.from('ab2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'));
        }).should.throw(Error);
      });
    });
  });

  describe('#sign', function () {
    it('should create signature', function () {
      const tx = new Transaction({
        from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
        nonce: 123,
        to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
        data: Buffer.from('hello world'),
        gasPrice: 456,
        gasLimit: 100000,
      });
      tx.sign()
        .compare(Buffer.from('ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'))
        .should.equal(0);
    });
  });

  describe('#toJSON', function () {
    context('full', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          data: Buffer.from('hello world').toString('hex'),
          gasPrice: '456',
          gasLimit: '100000',
          signature: 'ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b',
        });
      });
    });
    
    context('without signature', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          to: Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'),
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
        });
        const json = tx.toJSON();
        json.should.eql({
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          data: Buffer.from('hello world').toString('hex'),
          gasPrice: '456',
          gasLimit: '100000',
          signature: null,
        });
      });
    });

    context('without to address', function () {
      it('should return JSON', function () {
        const tx = new Transaction({
          from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
          nonce: 123,
          data: Buffer.from('hello world'),
          gasPrice: 456,
          gasLimit: 100000,
          signature: Buffer.from('0d7f4a1fcd8961bcb649c9fe47aca0676b2af6967e1631cb8b45aeab98535350759b0671c7579dd37cea9e1641ba6c74d77db0d5303966de6a136978d6326706', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: null,
          data: Buffer.from('hello world').toString('hex'),
          gasPrice: '456',
          gasLimit: '100000',
          signature: '0d7f4a1fcd8961bcb649c9fe47aca0676b2af6967e1631cb8b45aeab98535350759b0671c7579dd37cea9e1641ba6c74d77db0d5303966de6a136978d6326706',
        });
      });
    });
  });

  describe('#fromBuffer', function() {
    context('full', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f89df864a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37bb840ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b8b68656c6c6f20776f726c64a358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb830186a08201c8', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        const signature = tx.signature;
        if (!signature) {
          throw Error('Missing signature');
        }
        signature
          .compare(Buffer.from('ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b', 'hex'))
          .should.equal(0);
        const to = tx.to;
        if (!to) {
          throw Error('Missing to');
        }
        to.toString().should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        tx.data.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });

    context('without signature', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f85be3a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37b808b68656c6c6f20776f726c64a358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb830186a08201c8', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        expect(tx.signature).to.be.null;
        const to = tx.to;
        if (!to) {
          throw Error('Missing to');
        }
        to.toString().should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        tx.data.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });

    context('without to address', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f89df864a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37bb8400d7f4a1fcd8961bcb649c9fe47aca0676b2af6967e1631cb8b45aeab98535350759b0671c7579dd37cea9e1641ba6c74d77db0d5303966de6a136978d63267068b68656c6c6f20776f726c64a30000000000000000000000000000000000000000000000000000000000000000000000830186a08201c8', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        const signature = tx.signature;
        if (!signature) {
          throw Error('Missing signature');
        }
        signature
          .compare(Buffer.from('0d7f4a1fcd8961bcb649c9fe47aca0676b2af6967e1631cb8b45aeab98535350759b0671c7579dd37cea9e1641ba6c74d77db0d5303966de6a136978d6326706', 'hex'))
          .should.equal(0);
        expect(tx.to).to.be.null;
        tx.data.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });
  });
});
