import { should } from 'chai';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Header, Contract } from '../src/abi';

should();

describe('Header', function () {
  // by CDT
  const sampleJSON = JSON.parse(readFileSync(join(__dirname, 'token-abi.json'), 'utf-8'));
  // by go implementation
  const sampleBytes = Buffer.from('f8a801f864d28b6765745f62616c616e6365c5c480800a80cc8a69735f70617573696e67c0cb846d696e74c5c480800380c7857061757365c0d0897365745f6f776e6572c5c480800a80d4887472616e73666572cac480800a80c480800380c987756e7061757365c0f83fd8844d696e74d2c682746f800a80ca86616d6f756e74800380e5885472616e73666572dbc88466726f6d800a80c682746f800a80ca86616d6f756e74800380', 'hex');

  describe('#fromJSON', function () {
    it('should return header', function () {
      const header = Header.fromJSON(sampleJSON);
      header.version.should.equal(1);
      header.functions.length.should.equal(7);
      header.functions[0].name.should.equal('get_balance');
      header.events.length.should.equal(2);
      header.events[0].name.should.equal('Mint');
    });
  });

  describe('#toJSON', function () {
    it('should return JSON', function () {
      const header = Header.fromJSON(sampleJSON);
      // TODO: Revise JSON format
      JSON.parse(JSON.stringify(header.toJSON())).should.eql(sampleJSON);
    });
  });

  describe('#fromBuffer', function () {
    it('should return header', function () {
      const header = Header.fromBuffer(sampleBytes);
      header.version.should.equal(1);
      header.functions.length.should.equal(7);
      header.events.length.should.equal(2);
    });
  });

  describe('#toBuffer', function () {
    it('should return binary', function () {
      const header = Header.fromBuffer(sampleBytes);
      header.toBuffer().compare(sampleBytes).should.equal(0);
    });
  });
});

describe('Function', function () {
  describe('#encode', function () {
    it('should return encoded data', function () {
      const sampleJSON = JSON.parse(readFileSync(join(__dirname, 'parameters-abi.json'), 'utf-8'));
      const header = Header.fromJSON(sampleJSON);
      const data = header.functions[0].encode(['1', '256', '65536', '4294967296', '-1', '-1', '-1', '-1', '1.0', '1.0', 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53', ['1', '2', '3']]);
      data.compare(Buffer.from('f8648474657374b85df85b01820001840000010088000000000100000081ff82ffff84ffffffff88ffffffffffffffff840000803f88000000000000f03fa358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bbc3010203', 'hex'))
        .should.equal(0);
    });
  });
});

describe('Contract', function() {
  const sampleHeaderJSON = JSON.parse(readFileSync(join(__dirname, 'token-abi.json'), 'utf-8'));
  const sampleBytes = Buffer.from('f8adb8aaf8a801f864d28b6765745f62616c616e6365c5c480800a80cc8a69735f70617573696e67c0cb846d696e74c5c480800380c7857061757365c0d0897365745f6f776e6572c5c480800a80d4887472616e73666572cac480800a80c480800380c987756e7061757365c0f83fd8844d696e74d2c682746f800a80ca86616d6f756e74800380e5885472616e73666572dbc88466726f6d800a80c682746f800a80ca86616d6f756e7480038001', 'hex');
  const code = Buffer.alloc(1, 1);

  describe('#toBuffer', function () {
    it('should return binary', function () {
      const header = Header.fromJSON(sampleHeaderJSON);
      const contract = new Contract(header, code);
      contract.toBuffer().compare(sampleBytes).should.equal(0);
    });
  });

  describe('#fromBuffer', function () {
    it('should return contract', function () {
      const contract = Contract.fromBuffer(sampleBytes);
      contract.code.compare(code).should.equal(0);
    });
  });
});