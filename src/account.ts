import crc from 'crc';
import nacl from 'tweetnacl';
import { PUBLIC_KEY_LENGTH, PRIVATE_KEY_LENGTH, VERSION_BYTE_ACCOUNT } from './constants';
// base32 do not have type defination
const base32 = require('base32.js');

export default class Account {
  private key: Buffer;

  constructor(key: Buffer) {
    if (key.length === PRIVATE_KEY_LENGTH) {
      nacl.sign.keyPair.fromSecretKey(key);
      this.key = key;
    } else if (key.length === PUBLIC_KEY_LENGTH) {
      this.key = key;
    } else {
      throw Error('Invalid key');
    }
  }

  toString(): string {
    return base32.encode(this.getAddress());
  }

  getAddress(): Buffer {
    const versionBuffer = Buffer.from([VERSION_BYTE_ACCOUNT]);
    const payload = Buffer.concat([versionBuffer, this.getPublicKey()]);
    const checksum = calculateChecksum(payload);
    const unencoded = Buffer.concat([payload, checksum]);
    return unencoded;
  }

  getPublicKey(): Buffer {
    return this.key.slice(-PUBLIC_KEY_LENGTH);
  }

  getPrivateKey(): Buffer | undefined {
    if (this.key.length === PRIVATE_KEY_LENGTH) {
      return this.key;
    }
  }

  sign(message: Buffer): Buffer {
    if (!this.getPrivateKey()) {
      throw Error('Missing private key');
    }
    return Buffer.from(nacl.sign.detached(message, this.key));
  }

  verify(message: Buffer, signature: Buffer): boolean {
    return nacl.sign.detached.verify(message, signature, this.getPublicKey());
  }

  static fromAddress(address: Buffer): Account {
    const versionByte = address[0];
    const payload = address.slice(0, -2);
    const data = payload.slice(1);
    const checksum = address.slice(-2);

    if (versionByte !== VERSION_BYTE_ACCOUNT) {
      throw Error('Invalid version byte');
    }

    const expectedChecksum = calculateChecksum(payload);

    if (checksum.compare(expectedChecksum) !== 0) {
      throw Error('Invalid checksum byte');
    }

    return new Account(data);
  }

  static fromString(encoded: string): Account {
    return Account.fromAddress(base32.decode(encoded));
  }
  
  static fromSeed(seed: Buffer): Account {
    return new Account(Buffer.from(nacl.sign.keyPair.fromSeed(seed).secretKey));
  }
  
  static generate(): Account {
    return new Account(Buffer.from(nacl.sign.keyPair().secretKey));
  }
}

function calculateChecksum(payload: Buffer): Buffer {
  const checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(crc.crc16xmodem(payload), 0);
  return checksum;
}

