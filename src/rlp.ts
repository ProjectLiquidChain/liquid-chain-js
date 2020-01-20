import { encode, decode as originalDecode } from 'rlp';
import { RecursiveBuffer } from './types';

function decode(data: Buffer): RecursiveBuffer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalDecode(data) as any;
}

export { encode, decode };
