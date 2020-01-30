import axios, { AxiosInstance } from 'axios';
import Transaction from './transaction';

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

  async broadcast(data: string | Buffer | Transaction): Promise<string> {
    if (data instanceof Transaction) {
      data = data.toBuffer();
    }
    const { hash } = await this.request<BroadcastRequest, BroadcastResponse>('broadcast', {
      rawTx: typeof data === 'string' ? data :  data.toString('hex'),
    });
    return hash;
  }
}
