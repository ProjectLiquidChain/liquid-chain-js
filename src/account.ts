import { crc16xmodem } from 'crc';
import { sign } from 'tweetnacl';
import { PUBLIC_KEY_LENGTH, PRIVATE_KEY_LENGTH, VERSION_BYTE_ACCOUNT } from './constants';
// base32 do not have type defination
// eslint-disable-next-line @typescript-eslint/no-var-requires
const base32 = require('base32.js');

function calculateChecksum(payload: Buffer): Buffer {
  const checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(crc16xmodem(payload), 0);
  return checksum;
}

export default class Account {
  private key: Buffer;

  constructor(key: Buffer) {
    if (key.length === PRIVATE_KEY_LENGTH) {
      sign.keyPair.fromSecretKey(key);
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

  hasPrivateKey(): boolean {
    return this.key.length === PRIVATE_KEY_LENGTH;
  }

  getPrivateKey(): Buffer {
    if (!this.hasPrivateKey()) {
      throw Error('Missing private key');
    }
    return this.key;
  }

  sign(message: Buffer): Buffer {
    return Buffer.from(sign.detached(message, this.getPrivateKey()));
  }

  verify(message: Buffer, signature: Buffer): boolean {
    return sign.detached.verify(message, signature, this.getPublicKey());
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
    return new Account(Buffer.from(sign.keyPair.fromSeed(seed).secretKey));
  }
  
  static generate(): Account {
    return new Account(Buffer.from(sign.keyPair().secretKey));
  }
}
