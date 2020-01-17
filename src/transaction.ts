import Account from './account';
import { encode } from 'rlp';
import { createHash } from 'blake2';

export default class Transaction {
  // signer
  private from: Account;
  private nonce: number;
  private signature?: Buffer;

  private to?: Account;
  private data?: Buffer;
  private gasPrice: number;
  private gasLimit: number;
  
  constructor(params: { from: Account, nonce: number, to?: Account, data?: Buffer, gasPrice: number, gasLimit: number, signature?: Buffer }) {
    this.from = params.from;
    this.nonce = params.nonce;
    this.to = params.to;
    this.data = params.data;
    this.gasPrice = params.gasPrice;
    this.gasLimit = params.gasLimit;
    this.signature = params.signature;
  }

  serialize(includeSignature: boolean = true): Buffer {
    const signer = [
      this.from.getPublicKey(),
      this.nonce,
      includeSignature && this.signature ? this.signature : null,
    ];
    return encode([
      signer,
      this.data ? this.data : null,
      this.to ? this.to.getAddress() : Buffer.alloc(35),
      this.gasLimit,
      this.gasPrice,
    ]);
  }

  hash(): Buffer {
    const hash = createHash('blake2b');
    hash.update(this.serialize(false));
    return hash.digest();
  }

  sign(): Buffer {
    this.signature = this.from.sign(this.hash());
    return this.signature;
  }
}
