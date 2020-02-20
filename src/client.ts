import axios, { AxiosInstance } from 'axios';
import Transaction from './transaction';
import Account from './account';
import { HeaderJSON } from './abi';

export interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: string | number;
  error?: {
    code: string;
    message: string;
  };
  result: T;
}

export interface BroadcastRequest {
  rawTx: string;
}

export interface BroadcastResponse {
  hash: string;
}

export interface GetAccountRequest {
  address: string;
}

export interface GetAccountResponse {
  account: {
    nonce: string;
    contractHash?: string;
    contract?: {
      header: HeaderJSON;
      code: string;
    };
  };
}

export interface GetTransactionRequest {
  hash: string;
}

export interface Block {
  hash: string;
  time: string;
  height: number;
}

export interface TransctionEventAttribute {
  key: string;
  type: string;
  value: string;
}

export interface TransctionEvent {
  name: string;
  contract: string;
  attributes: TransctionEventAttribute[];
}

export interface GetTransactionResponse {
  tx: {
    hash: string;
    block: Block;
    result: number;
    from: string;
    to: string;
    contract: string;
    info: string;
    gasUsed: number;
    gasLimit: number;
    gasPrice: number;
    nonce: number;
    events: TransctionEvent[];
  };
}

export interface CallRequest {
  address: string;
  method: string;
  args: string[];
  height?: number;
}

export interface CallResponse {
  value: number;
  events: TransctionEvent[];
}

export default class Client {
  client: AxiosInstance;

  constructor(url: string) {
    this.client = axios.create({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
  }

  async request<T, R>(method: string, params: T): Promise<R> {
    const { data } = await this.client.request<JsonRpcResponse<R>>({
      data: JSON.stringify({
        method,
        id: Date.now(),
        jsonrpc: '2.0',
        params,
      }),
    });
    if (data.error) {
      throw Error(data.error.message);
    }
    return data.result;
  }

  async broadcast(data: string | Buffer | Transaction): Promise<BroadcastResponse> {
    if (data instanceof Transaction) {
      data = data.toBuffer();
    }
    return this.request<BroadcastRequest, BroadcastResponse>('chain.Broadcast', {
      rawTx: typeof data === 'string' ? data :  data.toString('base64'),
    });
  }

  async getAccount(address: string | Account): Promise<GetAccountResponse> {
    if (address instanceof Account) {
      address = address.toString();
    }
    return this.request<GetAccountRequest, GetAccountResponse>('storage.GetAccount', {
      address,
    });
  }

  async getTransaction(hash: string): Promise<GetTransactionResponse> {
    return this.request<GetTransactionRequest, GetTransactionResponse>('chain.GetTx', {
      hash,
    });
  }

  async call(address: string | Account, method: string, args: string[], height?: number): Promise<CallResponse> {
    if (address instanceof Account) {
      address = address.toString();
    }
    return this.request<CallRequest, CallResponse>('storage.Call', {
      address,
      method,
      args,
      height: height || 0,
    });
  }
}
