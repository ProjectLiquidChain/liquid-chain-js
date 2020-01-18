import Account from './account';
import { encode, decode } from 'rlp';
import { createHash } from 'blake2';

export interface TransactionJSON {
  hash: string;
  from: string;
  nonce: number;
  signture?: string;
  data?: string;
  to?: string;
  gasPrice: number;
  gasLimit: number;
}

export default class Transaction {
  // signer
  private from: Account;
  private nonce: number;
  private signature?: Buffer;

  private data?: Buffer;
  private to?: Account;
  private gasPrice: number;
  private gasLimit: number;
  
  constructor(params: { from: Account, nonce: number, to?: Account, data?: Buffer, gasPrice: number, gasLimit: number, signature?: Buffer }) {
    this.from = params.from;
    this.nonce = params.nonce;
    this.data = params.data;
    this.to = params.to;
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

  getFrom(): Account {
    return this.from;
  }

  getTo(): Account | undefined {
    return this.to;
  }

  getNonce(): number {
    return this.nonce;
  }

  getSignature(): Buffer | undefined {
    return this.signature;
  }

  getData(): Buffer | undefined {
    return this.data;
  }

  getGasPrice(): number {
    return this.gasPrice;
  }

  getGasLimit(): number {
    return this.gasLimit;
  }

  setSignature(signture: Buffer) {
    this.signature = signture;
  }

  toJSON(): TransactionJSON {
    return {
      hash: this.hash().toString('hex'),
      from: this.from.toString(),
      nonce: this.nonce,
      signture: this.signature ? this.signature.toString('hex') : undefined,
      data: this.data ? this.data.toString('hex') : undefined,
      to: this.to ? this.to.toString() : undefined,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
    }
  }

  static deserialize(data: Buffer): Transaction {
    const decoded: any = decode(data);
    const signer: Buffer[] = decoded[0];
    const tx: Buffer[] = decoded;
    return new Transaction({
      from: Account.fromPublicKey(signer[0]),
      nonce: parseInt(signer[1].toString('hex'), 16),
      signature: signer[2].length > 0 ? signer[2] : undefined,
      data: tx[1].length ? tx[1] : undefined,
      to: tx[2].length > 0 ? Account.fromAddress(tx[2]) : undefined,
      gasPrice: tx[3].length > 0 ? parseInt(tx[3].toString('hex'), 16) : 0,
      gasLimit: tx[4].length > 0 ? parseInt(tx[4].toString('hex'), 16) : 0,
    });
  }
}
