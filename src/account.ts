import crc from 'crc';
import nacl from 'tweetnacl';
// base32 do not have type defination
const base32 = require('base32.js');

// 'L'
export const VERSION_BYTE_ACCOUNT = 11 << 3;
export const ADDRESS_LENGTH = 35;

export default class Account {
  publicKey: Buffer;
  privateKey: Buffer | null;

  private constructor(publicKey: Buffer | null, privateKey: Buffer | null | undefined) {
    if (privateKey) {
      const keyPair = nacl.sign.keyPair.fromSecretKey(privateKey);
      this.privateKey = privateKey;
      this.publicKey = Buffer.from(keyPair.publicKey);
    } else {
      if (publicKey == null) {
        throw Error('Missing public key');
      }
      this.publicKey = publicKey;
      this.privateKey = null;
    }
  }

  toString(): string {
    const versionBuffer = Buffer.from([VERSION_BYTE_ACCOUNT]);
    const payload = Buffer.concat([versionBuffer, this.publicKey]);
    const checksum = calculateChecksum(payload);
    const unencoded = Buffer.concat([payload, checksum]);

    return base32.encode(unencoded);
  }

  getPublicKey(): Buffer {
    return this.publicKey;
  }

  getPrivateKey(): Buffer | null | undefined {
    return this.privateKey;
  }

  sign(message: Buffer): Buffer {
    if (!this.privateKey) {
      throw Error('Missing private key');
    }
    return Buffer.from(nacl.sign.detached(message, this.privateKey));
  }

  verify(message: Buffer, signature: Buffer): boolean {
    return nacl.sign.detached.verify(message, signature, this.publicKey);
  }

  static fromString(encoded: string): Account {
    const decoded: Buffer = base32.decode(encoded);
    const versionByte = decoded[0];
    const payload = decoded.slice(0, -2);
    const data = payload.slice(1);
    const checksum = decoded.slice(-2);

    if (versionByte != VERSION_BYTE_ACCOUNT) {
      throw Error('Invalid version byte');
    }

    const expectedChecksum = calculateChecksum(payload);

    if (checksum != expectedChecksum) {
      throw Error('Invalid checksum');
    }

    return new Account(data, null);
  }

  static fromSeed(seed: Buffer): Account {
    return new Account(null, Buffer.from(nacl.sign.keyPair.fromSeed(seed).secretKey));
  }

  static generate(): Account {
    return new Account(null, Buffer.from(nacl.sign.keyPair().secretKey));
  }
}

function calculateChecksum(payload: Buffer): Buffer {
  const checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(crc.crc16xmodem(payload), 0);
  return checksum;
}

