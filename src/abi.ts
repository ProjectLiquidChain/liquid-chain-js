
import { encode, decode } from 'rlp';
import Account from './account';
import { RecursiveBuffer } from './types';
import { Uint64LE, Int64LE } from 'int64-buffer';
import { HASH_LENGTH, METHOD_ID_LENGTH, NULL_METHOD_ID, INIT_FUNCTION_NAME, ARRAY_SUFFIX, ADDRESS_LENGTH } from './constants';
import { off } from 'process';
// blakejs do not have type defination
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { blake2b } = require('blakejs');

export enum PrimitiveType {
  Uint8,
	Uint16, 
	Uint32,
	Uint64, 
	Int8, 
	Int16,
	Int32,
	Int64, 
	Float32,
	Float64,
	Address,
}

export const PRIMITIVE_TYPE_SIZE = {
  [PrimitiveType.Uint8.toString()]: 1,
  [PrimitiveType.Uint16.toString()]: 2,
  [PrimitiveType.Uint32.toString()]: 4,
  [PrimitiveType.Uint64.toString()]: 8,
  [PrimitiveType.Int8.toString()]: 1,
  [PrimitiveType.Int16.toString()]: 2,
  [PrimitiveType.Int32.toString()]: 4,
  [PrimitiveType.Int64.toString()]: 8,
  [PrimitiveType.Float32.toString()]: 4,
  [PrimitiveType.Float64.toString()]: 8,
  [PrimitiveType.Address.toString()]: ADDRESS_LENGTH,
} as { [key: string]: number };

export interface ParameterJSON {
  name: string;
  type: string;
}

export type ParameterArray = [string, number, number];

export class Parameter {
  name: string;
  isArray: boolean;
  type: PrimitiveType;

  constructor(name: string, isArray: boolean, type: PrimitiveType) {
    this.name = name;
    this.isArray = isArray;
    this.type = type;
  }

  toArray(): ParameterArray {
    return [
      this.name,
      this.isArray ? 1 : 0,
      this.type,
    ];
  }

  toJSON(): ParameterJSON {
    return {
      name: this.name,
      type: PrimitiveType[this.type].toLowerCase() + (this.isArray ? ARRAY_SUFFIX : ''),
    };
  }

  encode(values: string | string[]): Buffer | Buffer[] {
    const value = values as string;
    if (this.isArray) {
      const parseValues = value[0] === '[' && value[value.length - 1] === ']'
        ? value.slice(1, value.length - 1).split(',')
        : values as string[];
      if (Array.isArray(parseValues)) {
        return parseValues.reduce((a, v) => Buffer.concat([a, this.encode(v) as Buffer]), Buffer.alloc(0));
      }
    }
    const length = PRIMITIVE_TYPE_SIZE[this.type.toString()];
    const ret = Buffer.alloc(length);
    switch (this.type) {
      case PrimitiveType.Uint8:
        ret.writeUInt8(parseInt(value), 0);
        break;
      case PrimitiveType.Uint16:
        ret.writeUInt16LE(parseInt(value), 0);
        break;
      case PrimitiveType.Uint32:
        ret.writeUInt32LE(parseInt(value), 0);
        break;
      case PrimitiveType.Uint64:
        new Uint64LE(value, 10).toBuffer().copy(ret);
        break;
      case PrimitiveType.Int8:
        ret.writeInt8(parseInt(value), 0);
        break;
      case PrimitiveType.Int16:
        ret.writeInt16LE(parseInt(value), 0);
        break;
      case PrimitiveType.Int32:
        ret.writeInt32LE(parseInt(value), 0);
        break;
      case PrimitiveType.Int64:
        new Int64LE(value, 10).toBuffer().copy(ret);
        break;
      case PrimitiveType.Float32:
        ret.writeFloatLE(parseFloat(value), 0);
        break;
      case PrimitiveType.Float64:
        ret.writeDoubleLE(parseFloat(value), 0);
        break;
      case PrimitiveType.Address:
        Account.fromString(value).address.copy(ret);
        break;
      default:
        throw Error('Encoder not found');
    }
    return ret;
  }

  decode(raw: Buffer): string | string[] {
    let offset = 0;
    const length = PRIMITIVE_TYPE_SIZE[this.type.toString()];
    const result = [] as string[];
    while (offset < raw.length) {
      const data = raw.slice(offset, offset + length);
      switch (this.type) {
        case PrimitiveType.Uint8:
          result.push(data.readUInt8(0).toString());
          break;
        case PrimitiveType.Int8:
          result.push(data.readInt8(0).toString());
          break;
        case PrimitiveType.Uint16:
          result.push(data.readUInt16LE(0).toString());
          break;
        case PrimitiveType.Int16:
          result.push(data.readInt16LE(0).toString());
          break;
        case PrimitiveType.Uint32:
          result.push(data.readUInt32LE(0).toString());
          break;
        case PrimitiveType.Int32:
          result.push(data.readInt32LE(0).toString());
          break;
        case PrimitiveType.Uint64:
          result.push(new Uint64LE(data).toString());
          break;
        case PrimitiveType.Int64:
          result.push(new Int64LE(data).toString());
          break;
        case PrimitiveType.Float32:
          result.push(data.readFloatLE(0).toString());
          break;
        case PrimitiveType.Float64:
          result.push(data.readDoubleLE(0).toString());
          break;
        case PrimitiveType.Address:
          result.push(Account.fromAddress(data).toString());
          break;
        default:
          throw Error('Decoder not found');
      }
      offset += length;
    }
    return this.isArray ? result : result[0];
  }

  static fromBuffer(decoded: RecursiveBuffer): Parameter {
    const data = decoded as Buffer[];
    return new Parameter(
      data[0].toString(),
      data[1].length > 0 ? true : false,
      parseInt(`0x${data[2].toString('hex')}`),
    );
  }

  static fromJSON(json: ParameterJSON): Parameter {
    const isArray = json.type.endsWith(ARRAY_SUFFIX);
    const typeName = isArray ? json.type.slice(0, json.type.length - ARRAY_SUFFIX.length) : json.type;
    const type = PrimitiveType[(typeName.charAt(0).toUpperCase() + typeName.slice(1)) as keyof typeof PrimitiveType];
    return new Parameter(
      json.name,
      isArray,
      type,
    );
  }
}

export interface FunctionJSON {
  name: string;
  parameters: ParameterJSON[];
}

export type EventJSON = FunctionJSON;

export type FunctionArray = [string, ParameterArray[]];

export type EventArray = FunctionArray;

export class Function {
  name: string;
  parameters: Parameter[];

  constructor(name: string, parameters: Parameter[]) {
    this.name = name;
    this.parameters = parameters;
  }

  toArray(): FunctionArray {
    return [
      this.name,
      this.parameters.map(p => p.toArray()),
    ];
  }

  toJSON(): FunctionJSON {
    return {
      name: this.name,
      parameters: this.parameters.map(p => p.toJSON()),
    }
  }

  get methodId(): Buffer {
    return Buffer.from(blake2b(Buffer.from(this.name), null, HASH_LENGTH)).slice(0, METHOD_ID_LENGTH);
  }

  encode(args: (string | string[])[]): (Buffer | null)[] {
    return [
      this.methodId,
      encode(args.map((v, i) => this.parameters[i].encode(v))),
      null,
    ];
  }

  decode(payload: (Buffer | null)[]): (string | string[])[] {
    if (this.methodId.compare(payload[0] as Buffer) !== 0) {
      throw Error('Function name mismatch');
    }
    const decoded = decode(payload[1]) as RecursiveBuffer;
    return (decoded as Buffer[]).map((d, i) => this.parameters[i].decode(d));
  }

  static fromBuffer(decoded: RecursiveBuffer): Function {
    return new Function(
      decoded[0].toString(),
      (decoded[1] as RecursiveBuffer[]).map(p => Parameter.fromBuffer(p)),
    );
  }

  static fromJSON(json: FunctionJSON): Function {
    return new Function(
      json.name,
      json.parameters.map(p => Parameter.fromJSON(p)),
    );
  }
}

export class Event extends Function {
  static fromBuffer(decoded: RecursiveBuffer): Event {
    return Function.fromBuffer(decoded) as Event;
  }

  static fromJSON(json: EventJSON): Event {
    return Function.fromJSON(json) as Event;
  }
}

export interface HeaderJSON {
  version: number;
  functions: FunctionJSON[] | {[key: string]: FunctionJSON};
  events: EventJSON[] | { [key: string]: FunctionJSON };
}

export class Header {
  version: number;
  functions: Function[];
  events: Event[];

  constructor(version: number, functions: Function[], events: Event[]) {
    this.version = version;
    this.functions = functions;
    this.events = events;
  }

  toBuffer(): Buffer {
    return encode([
      this.version,
      // Sort for consistent with go implementation, not relate to consenseus
      [...this.functions].sort((a, b) => a.methodId.compare(b.methodId)).map(f => f.toArray()),
      [...this.events].sort((a, b) => a.methodId.compare(b.methodId)).map(e => e.toArray()),
    ]);
  }

  toJSON(): HeaderJSON {
    return {
      version: this.version,
      functions: this.functions.map(f => f.toJSON()),
      events: this.events.map(e => e.toJSON()),
    }
  }

  getFunction(name: string): Function {
    const func = this.functions.find(f => f.name === name);
    if (!func) {
      throw Error('Function not found');
    }
    return func;
  }

  static fromBuffer(data: Buffer): Header {
    const decoded = decode(data) as RecursiveBuffer;
    const functions = decoded[1] as RecursiveBuffer[];
    const events = decoded[2] as RecursiveBuffer[];
    return new Header(
      parseInt((decoded[0] as Buffer).toString('hex')),
      functions.map(f => Function.fromBuffer(f as RecursiveBuffer)),
      events.map(e => Event.fromBuffer(e as RecursiveBuffer)),
    );
  }

  static fromJSON(json: HeaderJSON): Header {
    return new Header(
      json.version,
      (json.functions as FunctionJSON[]).map(f => Function.fromJSON(f)),
      (json.events as EventJSON[]).map(e => Event.fromJSON(e)),
    );
  }
}

export class Contract {
  header: Header;
  code: Buffer;

  constructor(header: Header, code: Buffer) {
    this.header = header;
    this.code = code;
  }

  toBuffer(): Buffer {
    return encode([
      this.header.toBuffer(),
      this.code,
    ]);
  }

  encode(args?: (string | string[])[]): (Buffer | null)[] {
    if (args) {
      const init = this.header.functions.find(f => f.name === INIT_FUNCTION_NAME)!.encode(args);
      return [init[0], init[1], this.toBuffer()];
    }
    return [NULL_METHOD_ID, null, this.toBuffer()];
  }

  static fromBuffer(data: Buffer): Contract {
    const decoded = decode(data) as RecursiveBuffer;
    return new Contract(Header.fromBuffer(decoded[0] as Buffer), decoded[1] as Buffer);
  }
}
