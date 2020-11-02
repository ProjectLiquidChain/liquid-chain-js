import { crc16xmodem } from 'crc';
import { sign } from 'tweetnacl';
import { PUBLIC_KEY_LENGTH, PRIVATE_KEY_LENGTH, VERSION_BYTE_ACCOUNT, HASH_LENGTH } from './constants';
import BN from 'bn.js';
import { encode } from 'rlp';
// base32 do not have type defination
// eslint-disable-next-line @typescript-eslint/no-var-requires
const base32 = require('base32.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { blake2b } = require('blakejs');

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
    return base32.encode(this.address);
  }

  get address(): Buffer {
    const versionBuffer = Buffer.from([VERSION_BYTE_ACCOUNT]);
    const payload = Buffer.concat([versionBuffer, this.publicKey]);
    const checksum = calculateChecksum(payload);
    const unencoded = Buffer.concat([payload, checksum]);
    return unencoded;
  }

  get publicKey(): Buffer {
    return this.key.slice(-PUBLIC_KEY_LENGTH);
  }

  get hasPrivateKey(): boolean {
    return this.key.length === PRIVATE_KEY_LENGTH;
  }

  get privateKey(): Buffer {
    if (!this.hasPrivateKey) {
      throw Error('Missing private key');
    }
    return this.key;
  }

  create(nonce: number | string | BN): Account {
    const n = new BN(nonce);
    const signer = encode([
      this.address,
      n.isZero() ? 0 : n,
    ]);
    return new Account(Buffer.from(blake2b(signer, null, HASH_LENGTH)));
  }

  sign(message: Buffer): Buffer {
    return Buffer.from(sign.detached(message, this.privateKey));
  }

  verify(message: Buffer, signature: Buffer): boolean {
    return sign.detached.verify(message, signature, this.publicKey);
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
    return Account.fromAddress(Buffer.from(base32.decode(encoded)));
  }
  
  static fromSeed(seed: Buffer): Account {
    return new Account(Buffer.from(sign.keyPair.fromSeed(seed).secretKey));
  }
  
  static generate(): Account {
    return new Account(Buffer.from(sign.keyPair().secretKey));
  }
}
