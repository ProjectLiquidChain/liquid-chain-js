import Account from './account';
import { NULL_ADDRESS, SIGNATURE_HASH_LENGTH, PUBLIC_KEY_LENGTH } from './constants';
import { encode, decode } from 'rlp';
import blake2b from 'blake2';
import crypto from 'crypto';
import BN from 'bn.js';
import { RecursiveBuffer } from './types';

export interface TransactionJSON {
  from: string;
  nonce: string;
  signature: string | null;
  data: string;
  to: string | null;
  gasLimit: string;
  gasPrice: string;
}

export default class Transaction {
  // signer
  from: Account;
  nonce: BN;
  signature: Buffer | null; 
  data: Buffer;
  to: Account | null;
  gasLimit: BN;
  gasPrice: BN;
  
  constructor(params: { 
      from: Account;
      nonce: number | BN;
      to?: Account | null;
      data: Buffer;
      gasLimit: number | BN;
      gasPrice: number | BN;
      signature?: Buffer | null;
    }) {
    this.from = params.from;
    this.nonce = new BN(params.nonce);
    this.data = params.data;
    this.to = params.to || null;
    this.gasLimit = new BN(params.gasLimit);
    this.gasPrice = new BN(params.gasPrice);
    this.signature = null;
    if (params.signature) {
      this.sign(params.signature);
    }
  }
  

  toBuffer(includeSignature = true): Buffer {
    const signer = [
      this.from.publicKey,
      this.nonce.isZero() ? 0 : this.nonce,
      includeSignature && this.signature ? this.signature : null,
    ];
    return encode([
      signer,
      this.data,
      this.to ? this.to.address : NULL_ADDRESS,
      this.gasLimit.isZero() ? 0 : this.gasLimit,
      this.gasPrice,
    ]);
  }

  get signatureHash(): Buffer {
    const hash = blake2b.createHash('blake2b', { digestLength: SIGNATURE_HASH_LENGTH });
    hash.update(this.toBuffer(false));
    return hash.digest();
  }

  get account(): Account {
    const signer = encode([
      this.from.publicKey,
      this.nonce.isZero() ? 0 : this.nonce,
      null,
    ]);
    const hash = blake2b.createHash('blake2b', { digestLength: PUBLIC_KEY_LENGTH });
    hash.update(signer);
    return new Account(hash.digest());
  }

  get hash(): string {
    // Tendermint hash
    const hash = crypto.createHash('sha256');
    hash.update(this.toBuffer());
    return hash.digest().toString('hex');
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
      from: this.from.toString(),
      nonce: this.nonce.toString(),
      signature: this.signature ? this.signature.toString('hex') : null,
      data: this.data.toString('hex'),
      to: this.to ? this.to.toString() : null,
      gasLimit: this.gasLimit.toString(),
      gasPrice: this.gasPrice.toString(),
    }
  }

  static fromBuffer(data: Buffer): Transaction {
    const decoded = decode(data) as RecursiveBuffer;
    const signer = decoded[0] as Buffer[];
    const tx = decoded as Buffer[];
    return new Transaction({
      from: new Account(signer[0]),
      nonce: new BN(signer[1]),
      signature: signer[2].length > 0 ? signer[2] : null,
      data: tx[1],
      to: tx[2].length > 0 && NULL_ADDRESS.compare(tx[2]) !== 0 ? Account.fromAddress(tx[2]) : null,
      gasLimit: new BN(tx[3]),
      gasPrice: new BN(tx[4]),
    });
  }
}
