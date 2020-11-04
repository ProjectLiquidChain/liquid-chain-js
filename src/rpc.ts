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
  code: number;
  log: string;
}

export interface GetAccountRequest {
  address: string;
}

export interface GetAccountResponse {
  account: {
    nonce: string;
    contractHash: string;
    storageHash: string;
    creator: string;
  };
}

export interface GetContractResponse {
  header: HeaderJSON;
  code: string;
}

export interface GetTransactionRequest {
  hash: string;
}

export interface Block {
  hash: string;
  time: string;
  height: number;
  parent: string;
  stateRoot: string;
  transactionRoot: string;
  receiptRoot: string;
  transactions: TransactionData[];
}

export interface GetBlockByHeightRequest {
  height: number;
}

export interface GetBlockResponse {
  block: Block;
}

export interface TransctionEventAttribute {
  name: string;
  type: string;
  value: string;
}

export interface TransctionEvent {
  name: string;
  contract: string;
  attributes: TransctionEventAttribute[];
}

export interface TransactionData {
  hash: string;
  type: string;
  height: number;
  version: number;
  sender: string;
  nonce: number;
  receiver: string;
  payload: {
    name: string;
    args: {
      type: string;
      name: string;
      value: string;
    } [];
  };
  gasPrice: string;
  gasLimit: string;
  receipt: {
    transaction: string;
    result: string;
    gasUsed: string;
    code: string;
    events: TransctionEvent[];
  };
}

export interface GetTransactionResponse {
  transaction: TransactionData;
}

export interface CallRequest {
  address: string;
  method: string;
  args: string[];
  height?: number;
}

export interface CallResponse {
  result: string;
  code: number;
  events: TransctionEvent[];
}

export class Client {
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
    const res = await this.request<BroadcastRequest, BroadcastResponse>('chain.Broadcast', {
      rawTx: typeof data === 'string' ? data :  data.toString('base64'),
    });
    if (res.code !== 0) {
      throw Error(res.log);
    }
    return res;
  }

  async getAccount(address: string | Account): Promise<GetAccountResponse> {
    if (address instanceof Account) {
      address = address.toString();
    }
    return this.request<GetAccountRequest, GetAccountResponse>('chain.GetAccount', {
      address,
    });
  }

  async getTransaction(hash: string): Promise<GetTransactionResponse> {
    return this.request<GetTransactionRequest, GetTransactionResponse>('chain.GetTransaction', {
      hash,
    });
  }

  async call(address: string | Account, method: string, args: string[], height?: number): Promise<CallResponse> {
    if (address instanceof Account) {
      address = address.toString();
    }
    return this.request<CallRequest, CallResponse>('chain.Call', {
      address,
      method,
      args,
      height: height || 0,
    });
  }

  async getBlockByHeight(height: number): Promise<GetBlockResponse> {
    return this.request<GetBlockByHeightRequest, GetBlockResponse>('chain.GetBlockByHeight', {
      height,
    });
  }

  async getLatestBlock(): Promise<GetBlockResponse> {
    return this.request<{}, GetBlockResponse>('chain.GetLatestBlock', {});
  }

  async getContract(address: string | Account): Promise<GetContractResponse> {
    if (address instanceof Account) {
      address = address.toString();
    }
    return this.request<GetAccountRequest, GetContractResponse>('chain.GetContract', {
      address,
    });
  }
}
