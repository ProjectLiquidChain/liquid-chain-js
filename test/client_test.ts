import { should } from 'chai';
import Mock from 'axios-mock-adapter';
import Client from '../src/client';
import Transaction from '../src/transaction';
import Account from '../src/account';

should();

describe('Client', function () {
  const NODE_URL = 'http://node1.liquid.com/jsonrpc';

  describe('broadcast', function () {
    context('valid request', function () {
      it('should return tx hash', async function () {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, {
          result: {
            hash: 'abc123',
          },
        });
        const txBytes = Buffer.from('f89df864a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37bb840ac2be566e387719c1640fcd2d0e6032eb16e5a80bbb9d409278f238d38ebf97cf8fbc73bfcaa270e2508cb46a22c9aca46293aec7ad7c996911cf16d61bd3c0b8b68656c6c6f20776f726c64a358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb830186a08201c8', 'hex');
        const { hash: hash1 } = await client.broadcast(txBytes.toString('hex'));
        hash1.should.equal('abc123');

        const { hash: hash2 } = await client.broadcast(Transaction.fromBuffer(txBytes));
        hash2.should.equal('abc123');

        const { hash: hash3 } = await client.broadcast(txBytes);
        hash3.should.equal('abc123');
      });
    });

    context('invalid request', function () {
      it('should throw error', function (done) {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, {
          error: {
            code: -1,
            message: 'Invalid payload',
          }
        });
        client.broadcast('ABCXYZ').then(function () {
          done(Error('Should throw error'));
        }, function () {
          done();
        });
      });
    });
  });

  describe('getAccount', function () {
    context('valid request', function () {
      it('should return account', async function () {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, {
          result: {
            account: {
              nonce: '123456',
            },
          },
        });
        const res1 = await client.getAccount('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
        res1.account.nonce.should.equal('123456');

        const res2 = await client.getAccount(Account.fromString('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53'));
        res2.account.nonce.should.equal('123456');

      });
    });
  });

  describe('call', function () {
    context('valid request', function () {
      it('should return value', async function () {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, {
          result: {
            value: 100,
            events: [],
          },
        });
        const res1 = await client.call('LD5XLQKZN5UJVLGKQNFDWQSMPACCS4TPFGJI5HI75TCMSLI4TTT7DXYP', 'get_balance', ['LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R']);
        res1.value.should.equal(100);

        const res2 = await client.call(Account.fromString('LD5XLQKZN5UJVLGKQNFDWQSMPACCS4TPFGJI5HI75TCMSLI4TTT7DXYP'), 'get_balance', ['LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R'], 5);
        res2.value.should.equal(100);
      });
    });
  });
});
