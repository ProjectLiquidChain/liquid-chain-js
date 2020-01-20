import Account from './account';
import { NULL_ADDRESS, SIGNATURE_HASH_LENGTH } from './constants';
import { encode, decode } from './rlp';
import { createHash } from 'blake2';
import BN from 'bn.js';

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
  private from: Account;
  private nonce: BN;
  private signature: Buffer | null;

  private data: Buffer;
  private to: Account | null;
  private gasLimit: BN;
  private gasPrice: BN;
  
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
      this.setSignature(params.signature);
    }
  }

  serialize(includeSignature = true): Buffer {
    const signer = [
      this.from.getPublicKey(),
      this.nonce,
      includeSignature && this.signature ? this.signature : null,
    ];
    return encode([
      signer,
      this.data,
      this.to ? this.to.getAddress() : NULL_ADDRESS,
      this.gasLimit,
      this.gasPrice,
    ]);
  }

  getSignatureHash(): Buffer {
    const hash = createHash('blake2b', { digestLength: SIGNATURE_HASH_LENGTH });
    hash.update(this.serialize(false));
    return hash.digest();
  }

  sign(): Buffer {
    this.signature = this.from.sign(this.getSignatureHash());
    return this.signature;
  }

  getFrom(): Account {
    return this.from;
  }

  getTo(): Account | null {
    return this.to;
  }

  getNonce(): BN {
    return this.nonce;
  }

  getSignature(): Buffer | null {
    return this.signature;
  }

  getData(): Buffer {
    return this.data;
  }

  getGasLimit(): BN {
    return this.gasLimit;
  }

  getGasPrice(): BN {
    return this.gasPrice;
  }

  setSignature(signture: Buffer): void {
    if (!this.from.verify(this.getSignatureHash(), signture)) {
      throw Error('Invalid signature');
    }
    this.signature = signture;
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

  static deserialize(data: Buffer): Transaction {
    const decoded = decode(data);
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
