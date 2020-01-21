import { should } from 'chai';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Header } from '../src/abi';

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
      header.events.length.should.equal(2);
    });
  });

  describe('#toJSON', function () {
    it('should return JSON', function () {
      const header = Header.fromJSON(sampleJSON);
      // TODO: Revise JSON format
      JSON.parse(JSON.stringify(header.toJSON())).should.eql(sampleJSON);
    });
  });

  describe('#deserialize', function () {
    it('should return header', function () {
      const header = Header.deserialize(sampleBytes);
      header.version.should.equal(1);
      header.functions.length.should.equal(7);
      header.events.length.should.equal(2);
    });
  });

  describe('#serialize', function () {
    it('should return binary', function () {
      const header = Header.deserialize(sampleBytes);
      header.serialize().compare(sampleBytes).should.equal(0);
    });
  });
});