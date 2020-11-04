import { should } from 'chai';
import Mock from 'axios-mock-adapter';
import { Client } from '../src/rpc';
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
            code: 0,
            hash: 'abc123',
          },
        });
        const txBytes = Buffer.from('f8a801e2a0cfc611ee4df64337615866b262f53e04dd82a0fa1c4fff45ddcc8f55b9381fe37ba358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbd6847465737484617267738b68656c6c6f20776f726c64830186a08201c8b840c8169875cb594899a66ba70ca9014a1f403596ab2dbbe80768be177154b0238860161e29ddcb1d61759cd9d340623af868b479e062370ec9855c920097be4009', 'hex');
        const { hash: hash1 } = await client.broadcast(txBytes.toString('base64'));
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

  describe('getTransction', function () {
    context('valid request', function () {
      it('should return transction', async function () {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, JSON.parse('{"jsonrpc":"2.0","result":{"transaction":{"hash":"9541a7267185166185fa440f441684e002460aa6720d532f7175b565af77c424","type":"invoke","height":136,"version":1,"sender":"LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R","nonce":1,"receiver":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS","payload":{"name":"transfer","args":[{"type":"address","name":"to","value":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS"},{"type":"uint64","name":"amount","value":"1000"}]},"gasPrice":18,"gasLimit":100000,"signature":"+ONtqnpF4tgErhMKMRSMbf/Z5+g8+VBPJyzAMYdQ30ihC0Rim9cobGcGbHIMtCJg4ZK+uSKNPTDeZxPp84uuCA=="},"receipt":{"transaction":"9541a7267185166185fa440f441684e002460aa6720d532f7175b565af77c424","result":"0","gasUsed":5153,"code":0,"events":[{"contract":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS","name":"Transfer","args":[{"type":"address","name":"from","value":"LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R"},{"type":"address","name":"to","value":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS"},{"type":"uint64","name":"amount","value":"1000"},{"type":"uint64","name":"memo","value":"0"}]},{"contract":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS","name":"Transfer","args":[{"type":"address","name":"from","value":"LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R"},{"type":"address","name":"to","value":"LB36YY2JHKXFXSESE75QIB5KWTOPFJ5G4267PJWLPY4WDLHGCBRRJWLS"},{"type":"uint64","name":"amount","value":"92754"},{"type":"uint64","name":"memo","value":"0"}]}],"postState":"f2520fb64ed9127c09f2bd56169318fce9a3ef2310a8f34f8a61468d5ea38835"}},"id":1}'));
        const res = await client.getTransaction('9541a7267185166185fa440f441684e002460aa6720d532f7175b565af77c424');
        res.transaction.hash.should.equal('9541a7267185166185fa440f441684e002460aa6720d532f7175b565af77c424');
      });
    });
  });

  describe('call', function () {
    context('valid request', function () {
      it('should return value', async function () {
        const client = new Client(NODE_URL);
        const mock = new Mock(client.client);
        mock.onPost(NODE_URL).reply(200, JSON.parse('{"jsonrpc":"2.0","result":{"result":"999999906246","code":0,"events":[]},"id":1}'));
        const res1 = await client.call('LD5XLQKZN5UJVLGKQNFDWQSMPACCS4TPFGJI5HI75TCMSLI4TTT7DXYP', 'get_balance', ['LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R']);
        res1.result.should.equal('999999906246');

        const res2 = await client.call(Account.fromString('LD5XLQKZN5UJVLGKQNFDWQSMPACCS4TPFGJI5HI75TCMSLI4TTT7DXYP'), 'get_balance', ['LDH4MEPOJX3EGN3BLBTLEYXVHYCN3AVA7IOE772F3XGI6VNZHAP6GX5R'], 5);
        res2.result.should.equal('999999906246');
      });
    });
  });
});
