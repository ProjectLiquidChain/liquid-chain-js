
import { encode, decode } from 'rlp';
import { RecursiveBuffer } from './types';

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
  type: string;
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
    const typeName = (json.type.charAt(0).toUpperCase() + json.type.slice(1));
    return new Parameter(
      json.name,
      json.is_array,
      PrimitiveType[typeName as keyof typeof PrimitiveType],
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
  functions: FunctionJSON[];
  events: EventJSON[];
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
  }

  serialize(): Buffer {
    return encode([
      this.version,
      this.functions.map(f => f.toArray()),
      this.events.map(e => e.toArray()),
    ]);
  }

  toJSON(): HeaderJSON {
    return {
      version: this.version,
      functions: this.functions.map(f => f.toJSON()),
      events: this.events.map(e => e.toJSON()),
    }
  }

  static deserialize(data: Buffer): Header {
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
      json.functions.map(f => Function.fromJSON(f)),
      json.events.map(e => Event.fromJSON(e)),
    );
  }
}
