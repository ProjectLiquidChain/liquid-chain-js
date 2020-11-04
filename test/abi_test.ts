import { should, expect } from 'chai';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Header, Contract } from '../src/abi';

should();

describe('Header', function () {
  // by CDT
  const sampleJSON = JSON.parse(readFileSync(join(__dirname, 'token-abi.json'), 'utf-8'));
  // by go implementation
  const sampleBytes = Buffer.from('f8f701f8b8e88e6368616e67655f62616c616e6365d8c582746f800ac986616d6f756e748003c7847369676e8006d6947365745f6f776e65725f746f5f63726561746f72c0d4897365745f6f776e6572c9c8856f776e6572800ad084696e6974cac986616d6f756e748003c987756e7061757365c0c7857061757365c0da887472616e73666572d0c582746f800ac986616d6f756e748003d0846d696e74cac986616d6f756e748003d38b6765745f62616c616e6365c6c582746f800af83ae2885472616e73666572d8c78466726f6d800ac582746f800ac986616d6f756e748003d6844d696e74d0c582746f800ac986616d6f756e748003', 'hex');

  describe('#fromJSON', function () {
    it('should return header', function () {
      const header = Header.fromJSON(sampleJSON);
      header.version.should.equal(1);
      header.functions.length.should.equal(9);
      header.functions[0].name.should.equal('set_owner');
      header.events.length.should.equal(2);
      header.events[0].name.should.equal('Transfer');
    });
  });

  describe('#toJSON', function () {
    it('should return JSON', function () {
      const header = Header.fromJSON(sampleJSON);
      JSON.parse(JSON.stringify(header.toJSON())).should.eql(sampleJSON);
    });
  });

  describe('#fromBuffer', function () {
    it('should return header', function () {
      const header = Header.fromBuffer(sampleBytes);
      header.version.should.equal(1);
      header.functions.length.should.equal(9);
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
      const data = header.getFunction('test').encode(['1', '256', '65536', '4294967296', '-1', '-1', '-1', '-1', '1.0', '1.0', 'LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53', '[1,2,3]']);
      data[0]!.compare(Buffer.from('928b2036', 'hex')).should.equal(0);
      data[1]!.compare(Buffer.from('f85b01820001840000010088000000000100000081ff82ffff84ffffffff88ffffffffffffffff840000803f88000000000000f03fa358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb83010203', 'hex')).should.equal(0);
      expect(data[2]).to.be.null;
    });
  });

  describe('#decode', function () {
    it('should return decoded data', function () {
      const sampleJSON = JSON.parse(readFileSync(join(__dirname, 'parameters-abi.json'), 'utf-8'));
      const header = Header.fromJSON(sampleJSON);
      const decoded = header.functions[0].decode([
        Buffer.from('928b2036', 'hex'),
        Buffer.from('f85b01820001840000010088000000000100000081ff82ffff84ffffffff88ffffffffffffffff840000803f88000000000000f03fa358072a260b42a7cb042b32d3e86fc32053e51430420011f83bcd8bf6a09c8a3348a3bb83010203', 'hex'),
        null,
      ]);
      console.log(decoded);
      decoded[0].should.equal('1');
      decoded[1].should.equal('256');
      decoded[2].should.equal('65536');
      decoded[3].should.equal('4294967296');
      decoded[4].should.equal('-1');
      decoded[5].should.equal('-1');
      decoded[6].should.equal('-1');
      decoded[7].should.equal('-1');
      decoded[8].should.equal('1');
      decoded[9].should.equal('1');
      decoded[10].should.equal('LADSUJQLIKT4WBBLGLJ6Q36DEBJ6KFBQIIABD6B3ZWF7NIE4RIZURI53');
      decoded[11][0].should.equal('1');
      decoded[11][1].should.equal('2');
      decoded[11][2].should.equal('3');
    });
  });
});

describe('Contract', function() {
  const sampleHeaderJSON = JSON.parse(readFileSync(join(__dirname, 'token-abi.json'), 'utf-8'));
  const sampleBytes = Buffer.from('f8fcb8f9f8f701f8b8e88e6368616e67655f62616c616e6365d8c582746f800ac986616d6f756e748003c7847369676e8006d6947365745f6f776e65725f746f5f63726561746f72c0d4897365745f6f776e6572c9c8856f776e6572800ad084696e6974cac986616d6f756e748003c987756e7061757365c0c7857061757365c0da887472616e73666572d0c582746f800ac986616d6f756e748003d0846d696e74cac986616d6f756e748003d38b6765745f62616c616e6365c6c582746f800af83ae2885472616e73666572d8c78466726f6d800ac582746f800ac986616d6f756e748003d6844d696e74d0c582746f800ac986616d6f756e74800301', 'hex');
  const code = Buffer.alloc(1, 1);

  describe('#fromBuffer', function () {
    it('should return contract', function () {
      const contract = Contract.fromBuffer(sampleBytes);
      contract.code.compare(code).should.equal(0);
    });
  });

  describe('#encode', function () {
    const header = Header.fromJSON(sampleHeaderJSON);
    const contract = new Contract(header, code);
    context('without init', function () {
      it('should return payload', function () {
        const payload = contract.encode();
        payload[2]!.compare(sampleBytes).should.equal(0);
      });
    });

    context('with init', function () {
      it('should return payload', function () {
        const payload = contract.encode(['123456']);
        payload[0]!.compare(Buffer.from('44d6441f', 'hex')).should.equal(0);
        payload[1]!.compare(Buffer.from('c98840e2010000000000', 'hex')).should.equal(0);
        payload[2]!.compare(sampleBytes).should.equal(0);
      });
    });
  });
});