import Account from './account';
import { NULL_ADDRESS, HASH_LENGTH } from './constants';
import { encode, decode } from 'rlp';
import BN from 'bn.js';
import { RecursiveBuffer } from './types';
// blakejs do not have type defination
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { blake2b } = require('blakejs');

export interface TransactionJSON {
  version: number;
  from: string;
  nonce: string;
  payload: (string | null)[],
  to: string | null;
  gasPrice: number;
  gasLimit: number;
  signature: string | null;
}

export default class Transaction {
  version: BN;
  // sender
  from: Account;
  nonce: BN;
  payload: (Buffer |  null)[];
  to: Account | null;
  gasPrice: BN;
  gasLimit: BN;
  signature: Buffer | null; 
  
  constructor(params: { 
      version: number | string | BN,
      from: Account;
      nonce: number | string | BN;
      to?: Account | null;
      payload: (Buffer | null)[];
      gasPrice: number | string | BN;
      gasLimit: number | string | BN;
      signature?: Buffer | null;
    }) {
    this.version = new BN(params.version);
    this.from = params.from;
    this.nonce = new BN(params.nonce);
    this.payload = params.payload;
    this.to = params.to || null;
    this.gasPrice = new BN(params.gasPrice);
    this.gasLimit = new BN(params.gasLimit);
    this.signature = null;
    if (params.signature) {
      this.sign(params.signature);
    }
  }

  toBuffer(includeSignature = true): Buffer {
    const sender = [
      this.from.publicKey,
      this.nonce.isZero() ? 0 : this.nonce,
    ];
    const data = [
      this.version,
      sender,
      this.to ? this.to.address : NULL_ADDRESS,
      this.payload,
      this.gasPrice.isZero() ? 0 : this.gasPrice,
      this.gasLimit.isZero() ? 0 : this.gasLimit,
    ];
    if (includeSignature && this.signature) {
      if (!this.signature) {
        throw Error('No signature');
      }
      data.push(this.signature);
    }
    return encode(data);
  }

  get signatureHash(): Buffer {
    return Buffer.from(blake2b(this.toBuffer(false), null, HASH_LENGTH));
  }

  get hash(): string {
    return Buffer.from(blake2b(this.toBuffer(), null, HASH_LENGTH)).toString('hex');
  }

  sign(signature?: Buffer): Buffer {
    if (signature) {
      if (!this.from.verify(this.signatureHash, signature)) {
        throw Error('Invalid signature');
      }
      this.signature = signature;
    } else {
      this.signature = this.from.sign(this.signatureHash);
    }
    return this.signature;
  }

  toJSON(): TransactionJSON {
    return {
      version: this.version.toNumber(),
      from: this.from.toString(),
      nonce: this.nonce.toString(),
      payload: this.payload.map(p => p ? p.toString('hex') : null),
      to: this.to ? this.to.toString() : null,
      gasPrice: this.gasPrice.toNumber(),
      gasLimit: this.gasLimit.toNumber(),
      signature: this.signature ? this.signature.toString('hex') : null,
    }
  }

  static fromBuffer(data: Buffer): Transaction {
    const decoded = decode(data) as RecursiveBuffer;
    const sender = decoded[1] as Buffer[];
    const payload = decoded[3] as Buffer[];
    const tx = decoded as Buffer[];
    return new Transaction({
      version: new BN(tx[0]),
      from: new Account(sender[0]),
      nonce: new BN(sender[1]),
      to: tx[1].length > 0 && NULL_ADDRESS.compare(tx[2]) !== 0 ? Account.fromAddress(tx[2]) : null,
      payload: payload.map(p => p.length > 0 ? p : null),
      gasPrice: new BN(tx[4]),
      gasLimit: new BN(tx[5]),
      signature: tx[6] && tx[6].length > 0 ? tx[6] : null,
    });
  }
}
