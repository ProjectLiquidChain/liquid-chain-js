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
          .compare(Buffer.from('8e2446d14732b51a1af235accf2e603513c8107f086d3f78c1c85a003cc0e4c1', 'hex'))
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
          .compare(Buffer.from('810d457bf0dcd6dc05112d5b6245b30846d53a46d648860e090f8770a3da422c', 'hex'))
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
          signature: Buffer.from('c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex'),
        });
        tx.signatureHash
          .compare(Buffer.from('8e2446d14732b51a1af235accf2e603513c8107f086d3f78c1c85a003cc0e4c1', 'hex'))
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
          .compare(Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c64830186a08201c8b840c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex'))
          .should.equal(0);
        tx.hash.should.equal('2e9e7776b26a6abd022ef4bf4e82345db3bcc6a59ec6df9c58bcbc0f634f4195');
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
        .compare(Buffer.from('c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex'))
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
          signature: Buffer.from('c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          version: TRANSACTION_VERSION.toString(),
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: '456',
          gasLimit: '100000',
          signature: 'c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009',
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
          version: TRANSACTION_VERSION.toString(),
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53',
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: '456',
          gasLimit: '100000',
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
          signature: Buffer.from('7c97fbda368101be369624de7d33d2a77f5f280d407dab38200272bda85b189788d10a3bd864410bf8ae3859acc68dcdf53def4d515233c3cf0edf119a1a770a', 'hex'),
        });
        const json = tx.toJSON();
        json.should.eql({
          version: TRANSACTION_VERSION.toString(),
          from: 'LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R',
          nonce: '123',
          to: null,
          payload: [
            Buffer.from('test').toString('hex'),
            Buffer.from('args').toString('hex'),
            Buffer.from('hello world').toString('hex'),
          ],
          gasPrice: '456',
          gasLimit: '100000',
          signature: '7c97fbda368101be369624de7d33d2a77f5f280d407dab38200272bda85b189788d10a3bd864410bf8ae3859acc68dcdf53def4d515233c3cf0edf119a1a770a',
        });
      });
    });
  });

  describe('#fromBuffer', function() {
    context('full', function () {
      it('should return transaction', function () {
        const data = Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c64830186a08201c8b840c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        tx.signature!.compare(Buffer.from('c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex')).should.equal(0);
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
        const data = Buffer.from('f86601e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c64830186a08201c8', 'hex');
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
        const data = Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba30000000000000000000000000000000000000000000000000000000000000000000000d6847465737484617267738b68656c6c6f20776f726c64830186a08201c8b8407c97fbda368101be369624de7d33d2a77f5f280d407dab38200272bda85b189788d10a3bd864410bf8ae3859acc68dcdf53def4d515233c3cf0edf119a1a770a', 'hex');
        const tx = Transaction.fromBuffer(data);
        tx.from.toString().should.equal('LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R');
        tx.nonce.cmpn(123).should.equal(0);
        tx.signature!.compare(Buffer.from('7c97fbda368101be369624de7d33d2a77f5f280d407dab38200272bda85b189788d10a3bd864410bf8ae3859acc68dcdf53def4d515233c3cf0edf119a1a770a', 'hex')).should.equal(0);
        expect(tx.to).to.be.null;
        tx.payload[0]!.compare(Buffer.from('test')).should.equal(0);
        tx.payload[1]!.compare(Buffer.from('args')).should.equal(0);
        tx.payload[2]!.compare(Buffer.from('hello world')).should.equal(0);
        tx.gasPrice.cmpn(456).should.equal(0);
        tx.gasLimit.cmpn(100000).should.equal(0);
      });
    });
  });

  // describe('#getHash', function () {
  //   it('should return contract address', function () {
  //     const header = Header.fromJSON(JSON.parse(readFileSync(join(__dirname, 'token-abi.json'), 'utf-8')));
  //     const tx = new Transaction({
  //       from: Account.fromSeed(Buffer.from('b66311a8a3401fe772615c610bb6d4add13d373289f6841ed3dc87ac2ec0b16d', 'hex')),
  //       to: Account.fromString('LD5XLQKZN5UJVLGKQNFDWQSMPACCS4TPFGJI5HI75TCMSLI4TTT7DXYP'),
  //       nonce: 0,
  //       data: header.functions[2].encode(['123456']),
  //       gasPrice: 1,
  //       gasLimit: 0,
  //     });
  //     tx.sign();
  //     tx.hash.should.equal('04361eec2d43664bf8a86c5788b4fb2bfdf7e8b0e32479b7b6c028a275a66745');
  //   });
  // });
});
