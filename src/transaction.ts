import Account from './account';
import { encode, decode } from 'rlp';
import { createHash } from 'blake2';
import BN from 'bn.js';

export interface TransactionJSON {
  from: string;
  nonce: string;
  signture?: string;
  data?: string;
  to?: string;
  gasPrice: string;
  gasLimit: string;
}

export default class Transaction {
  // signer
  private from: Account;
  private nonce: BN;
  private signature?: Buffer;

  private data?: Buffer;
  private to?: Account;
  private gasPrice: BN;
  private gasLimit: BN;
  
  constructor(params: { from: Account, nonce: number | BN, to?: Account, data?: Buffer, gasPrice: number | BN, gasLimit: number | BN, signature?: Buffer }) {
    this.from = params.from;
    this.nonce = new BN(params.nonce);
    this.data = params.data;
    this.to = params.to;
    this.gasPrice = new BN(params.gasPrice);
    this.gasLimit = new BN(params.gasLimit);
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

  getSignatureHash(): Buffer {
    const hash = createHash('blake2b');
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

  getTo(): Account | undefined {
    return this.to;
  }

  getNonce(): BN {
    return this.nonce;
  }

  getSignature(): Buffer | undefined {
    return this.signature;
  }

  getData(): Buffer | undefined {
    return this.data;
  }

  getGasPrice(): BN {
    return this.gasPrice;
  }

  getGasLimit(): BN {
    return this.gasLimit;
  }

  setSignature(signture: Buffer) {
    this.signature = signture;
  }

  toJSON(): TransactionJSON {
    return {
      from: this.from.toString(),
      nonce: this.nonce.toString(),
      signture: this.signature ? this.signature.toString('hex') : undefined,
      data: this.data ? this.data.toString('hex') : undefined,
      to: this.to ? this.to.toString() : undefined,
      gasPrice: this.gasPrice.toString(),
      gasLimit: this.gasLimit.toString(),
    }
  }

  static deserialize(data: Buffer): Transaction {
    const decoded: any = decode(data);
    const signer: Buffer[] = decoded[0];
    const tx: Buffer[] = decoded;
    return new Transaction({
      from: Account.fromPublicKey(signer[0]),
      nonce: new BN(signer[1]),
      signature: signer[2].length > 0 ? signer[2] : undefined,
      data: tx[1].length ? tx[1] : undefined,
      to: tx[2].length > 0 ? Account.fromAddress(tx[2]) : undefined,
      gasPrice: new BN(tx[3]),
      gasLimit: new BN(tx[4]),
    });
  }
}
