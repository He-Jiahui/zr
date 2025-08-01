import {TNullable} from "../../analyzer/utils/zrCompilerTypes";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";
import type {ZrIntermediateWritable} from "../writable/writable";


export class ZrIntermediateWriter {
    private _size: number = 0;
    private _capacity: number = 0;
    private readonly _littleEndian: boolean;

    constructor(littleEndian: boolean = true) {
        this._buffer = null;
        this._size = 0;
        this._capacity = 0;
        this._littleEndian = littleEndian;
    }

    private _buffer: TNullable<Buffer>;

    public get buffer() {
        return new Uint8Array(this._buffer!.buffer, 0, this._size);
    }

    public writeAll(writable: ZrIntermediateWritable) {
        for (const data of writable.toWriteData) {
            this.write(data, (writable as any)[data[0]] as any);
        }
    }

    public clear() {
        this._buffer = null;
        this._size = 0;
        this._capacity = 0;
    }

    private write(data: IntermediateHeadType, raw: any) {
        const type = data[1];
        const args = data[2];
        const field = raw;
        switch (type) {
            case IntermediateValueType.Writable: {
                if (args) {
                    // single field
                    const writableField = field as ZrIntermediateWritable;
                    this.writeAll(writableField);
                } else {
                    // array field
                    const writableFields = field as ZrIntermediateWritable[];
                    this.writeUInt64(BigInt(writableFields.length));
                    for (const writableField of writableFields) {
                        this.writeAll(writableField);
                    }
                }
            }
                break;
            case IntermediateValueType.Binary: {
                this.writeBinary(field, args);
            }
                break;
            case IntermediateValueType.Empty: {
                // do nothing
            }
                break;
            case IntermediateValueType.Null: {
                this.writeBool(false);
            }
                break;
            case IntermediateValueType.Bool: {
                this.writeBool(field);
            }
                break;
            case IntermediateValueType.Int8: {
                this.writeInt8(field);
            }
                break;
            case IntermediateValueType.Int16: {
                this.writeInt16(field);
            }
                break;
            case IntermediateValueType.Int32: {
                this.writeInt32(field);
            }
                break;
            case IntermediateValueType.Int64: {
                this.writeInt64(BigInt(field));
            }
                break;
            case IntermediateValueType.String: {
                this.writeString(field);
            }
                break;
            case IntermediateValueType.UInt8: {
                this.writeUInt8(field);
            }
                break;
            case IntermediateValueType.UInt16: {
                this.writeUInt16(field);
            }
                break;
            case IntermediateValueType.UInt32: {
                this.writeUInt32(field);
            }
                break;
            case IntermediateValueType.UInt64: {
                this.writeUInt64(BigInt(field));
            }
                break;
            case IntermediateValueType.Float: {
                this.writeFloat(field);
            }
                break;
            case IntermediateValueType.Double: {
                this.writeDouble(field);
            }
                break;
            default: {
                throw new Error("Unknown type");
            }
        }
    }

    private ensureCapacity(required: number) {
        if (this._size + required > this._capacity) {
            this._capacity = this._capacity * 2 + required;
            const prevBuffer = this._buffer;
            const newBuffer = Buffer.alloc(this._capacity);
            if (prevBuffer) {
                prevBuffer.copy(newBuffer, 0, 0, this._size);
            }
            this._buffer = newBuffer;
        }
        return this._buffer!;
    }


    private writeUInt8(value: number) {
        this._size = this.ensureCapacity(1).writeUInt8(value, this._size);
    }

    private writeUInt16(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(2).writeUInt16LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(2).writeUInt16BE(value, this._size);
        }
    }

    private writeUInt32(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(4).writeUInt32LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(4).writeUInt32BE(value, this._size);
        }
    }

    private writeUInt64(value: bigint) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(8).writeBigUInt64LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(8).writeBigUInt64BE(value, this._size);
        }
    }

    private writeInt8(value: number) {
        this._size = this.ensureCapacity(1).writeInt8(value, this._size);
    }

    private writeInt16(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(2).writeInt16LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(2).writeInt16BE(value, this._size);
        }
    }

    private writeInt32(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(4).writeInt32LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(4).writeInt32BE(value, this._size);
        }
    }

    private writeInt64(value: bigint) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(8).writeBigInt64LE(value, this._size);
        } else {
            this._size = this.ensureCapacity(8).writeBigInt64BE(value, this._size);
        }
    }

    private writeBinary(value: string, length: number) {
        for (let i = 0; i < length; i++) {
            this.writeUInt8(value.charCodeAt(i));
        }
    }

    private writeString(value: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const length = data.length;
        this.writeUInt64(BigInt(length));
        for (let i = 0; i < length; i++) {
            this.writeUInt8(data[i]);
        }
    }

    private writeBool(value: boolean) {
        this.writeUInt8(value ? 1 : 0);
    }

    private writeFloat(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(4).writeFloatLE(value, this._size);
        } else {
            this._size = this.ensureCapacity(4).writeFloatBE(value, this._size);
        }
    }

    private writeDouble(value: number) {
        if (this._littleEndian) {
            this._size = this.ensureCapacity(8).writeDoubleLE(value, this._size);
        } else {
            this._size = this.ensureCapacity(8).writeDoubleBE(value, this._size);
        }
    }
}
