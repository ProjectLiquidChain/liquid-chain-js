
import { encode, decode } from 'rlp';
import Account from './account';
import { RecursiveBuffer, Recursive } from './types';
import { Uint64LE, Int64LE } from 'int64-buffer';

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

export interface ParameterJSON {
  name: string;
  is_array: boolean;
  type: string | PrimitiveType;
  size: number;
}

export type ParameterArray = [string, number, number, number];

export class Parameter {
  name: string;
  isArray: boolean;
  type: PrimitiveType;
  size: number;

  constructor(name: string, isArray: boolean, type: PrimitiveType, size: number) {
    this.name = name;
    this.isArray = isArray;
    this.type = type;
    this.size = size;
  }

  toArray(): ParameterArray {
    return [
      this.name,
      this.isArray ? 1 : 0,
      this.type,
      this.size,
    ];
  }

  toJSON(): ParameterJSON {
    return {
      name: this.name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_array: this.isArray,
      type: PrimitiveType[this.type].toLowerCase(),
      size: this.size,
    };
  }

  encode(values: string | string[]): Buffer | Buffer[] {
    if (this.isArray && Array.isArray(values)) {
      return values.map(v => this.encode(v) as Buffer);
    }
    let ret: Buffer;
    const value = values as string;
    switch (this.type) {
      case PrimitiveType.Uint8:
        ret = Buffer.alloc(1);
        ret.writeUInt8(parseInt(value), 0);
        break;
      case PrimitiveType.Uint16:
        ret = Buffer.alloc(2);
        ret.writeUInt16LE(parseInt(value), 0);
        break;
      case PrimitiveType.Uint32:
        ret = Buffer.alloc(4);
        ret.writeUInt32LE(parseInt(value), 0);
        break;
      case PrimitiveType.Uint64:
        ret = new Uint64LE(value, 10).toBuffer();
        break;
      case PrimitiveType.Int8:
        ret = Buffer.alloc(1);
        ret.writeInt8(parseInt(value), 0);
        break;
      case PrimitiveType.Int16:
        ret = Buffer.alloc(2);
        ret.writeInt16LE(parseInt(value), 0);
        break;
      case PrimitiveType.Int32:
        ret = Buffer.alloc(4);
        ret.writeInt32LE(parseInt(value), 0);
        break;
      case PrimitiveType.Int64:
        ret = new Int64LE(value, 10).toBuffer();
        break;
      case PrimitiveType.Float32:
        ret = Buffer.alloc(4);
        ret.writeFloatLE(parseFloat(value), 0);
        break;
      case PrimitiveType.Float64:
        ret = Buffer.alloc(8);
        ret.writeDoubleLE(parseFloat(value), 0);
        break;
      case PrimitiveType.Address:
        ret = Account.fromString(value).address;
        break;
      default:
        throw Error('Encoder not found');
    }
    return ret;
  }

  decode(raw: Buffer | Buffer[]): string | string[] {
    if (this.isArray && Array.isArray(raw)) {
      return raw.map(d => this.decode(d) as string);
    }
    const data = raw as Buffer;
    switch (this.type) {
      case PrimitiveType.Uint8:
        return data.readUInt8(0).toString();
      case PrimitiveType.Int8:
        return data.readInt8(0).toString();
      case PrimitiveType.Uint16:
        return data.readUInt16LE(0).toString();
      case PrimitiveType.Int16:
        return data.readInt16LE(0).toString();
      case PrimitiveType.Uint32:
        return data.readUInt32LE(0).toString();
      case PrimitiveType.Int32:
        return data.readInt32LE(0).toString();
      case PrimitiveType.Uint64:
        return new Uint64LE(data).toString();
      case PrimitiveType.Int64:
        return new Int64LE(data).toString();
      case PrimitiveType.Float32:
        return data.readFloatLE(0).toString();
      case PrimitiveType.Float64:
        return data.readDoubleLE(0).toString();
      case PrimitiveType.Address:
        return Account.fromAddress(data).toString();
      default:
        throw Error('Decoder not found');
    }
  }

  static fromBuffer(decoded: RecursiveBuffer): Parameter {
    const data = decoded as Buffer[];
    return new Parameter(
      data[0].toString(),
      data[1].length > 0 ? true : false,
      parseInt(`0x${data[2].toString('hex')}`),
      data[3].length > 0 ? parseInt(`0x${data[3].toString('hex')}`) : 0,
    );
  }

  static fromJSON(json: ParameterJSON): Parameter {
    const typeName = typeof json.type === 'string'
      ? (json.type.charAt(0).toUpperCase() + json.type.slice(1))
      : null;
    const type = typeName
      ? PrimitiveType[typeName as keyof typeof PrimitiveType]
      : json.type as PrimitiveType; 
    return new Parameter(
      json.name,
      json.is_array,
      type,
      json.size,
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

  encode(values: (string | string[])[]): Buffer {
    return encode([
      this.name,
      encode(values.map((v, i) => this.parameters[i].encode(v))),
    ]);
  }

  decode(raw: Buffer): (string | string[])[] {
    const decoded = decode(raw) as RecursiveBuffer;
    if (this.name !== (decoded[0] as Buffer).toString()) {
      throw Error('Function name mismatch');
    }
    return (decode(decoded[1]) as Buffer[]).map((d, i) => this.parameters[i].decode(d));
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
    // sort by name
    this.events.sort((e1, e2) => {
      return e1.name.localeCompare(e2.name);
    });
    this.functions.sort((e1, e2) => {
      return e1.name.localeCompare(e2.name);
    });
  }

  toBuffer(): Buffer {
    return encode([
      this.version,
      this.functions.map(f => f.toArray()),
      this.events.map(e => e.toArray()),
    ]);
  }

  toJSON(): HeaderJSON {
    return {
      version: this.version,
      functions: this.functions.map(f => f.toJSON()).sort(),
      events: this.events.map(e => e.toJSON()),
    }
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
      ((json.functions.map ? json.functions : Object.values(json.functions)) as FunctionJSON[])
        .map(f => Function.fromJSON(f)),
      ((json.events.map ? json.events : Object.values(json.events)) as EventJSON[])
        .map(e => Event.fromJSON(e)),
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

  static fromBuffer(data: Buffer): Contract {
    const decoded = decode(data) as RecursiveBuffer;
    return new Contract(Header.fromBuffer(decoded[0] as Buffer), decoded[1] as Buffer);
  }
}
