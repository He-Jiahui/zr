import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class IntType extends PredefinedType {
    public readonly name: string = TypeKeywords.Integer;

    public readonly unsigned: boolean;
    public readonly size: number;

    public constructor(unsigned: boolean, size: number) {
        super();
        this.unsigned = unsigned;
        this.size = size;
    }

    protected get _typeName(): string {
        return `${this.unsigned ? "u" : ""}${TypeKeywords.Integer}${this.size}`;
    }


    public compareTo(otherType: IntType): 0 | 1 | -1 {
        if (this.size > otherType.size) {
            return 1;
        }
        if (this.size < otherType.size) {
            return -1;
        }
        if (this.unsigned && !otherType.unsigned) {
            return 1;
        }
        if (this.unsigned && otherType.unsigned) {
            return 0;
        }
        if (!this.unsigned && !otherType.unsigned) {
            return 0;
        }

        return -1;
    }
}

const intTypes = {
    int8: new IntType(false, 8),
    int16: new IntType(false, 16),
    int32: new IntType(false, 32),
    int64: new IntType(false, 64),

    uint8: new IntType(true, 8),
    uint16: new IntType(true, 16),
    uint32: new IntType(true, 32),
    uint64: new IntType(true, 64)
};


PredefinedType.registerType(TypeKeywords.Char, intTypes.int8);
PredefinedType.registerType(TypeKeywords.Int8, intTypes.int8);
PredefinedType.registerType(TypeKeywords.Byte, intTypes.uint8);
PredefinedType.registerType(TypeKeywords.UInt8, intTypes.uint8);
PredefinedType.registerType(TypeKeywords.Short, intTypes.int16);
PredefinedType.registerType(TypeKeywords.Int16, intTypes.int16);
PredefinedType.registerType(TypeKeywords.UShort, intTypes.uint16);
PredefinedType.registerType(TypeKeywords.UInt16, intTypes.uint16);

PredefinedType.registerType(TypeKeywords.Integer, intTypes.int32);
PredefinedType.registerType(TypeKeywords.Int32, intTypes.int32);
PredefinedType.registerType(TypeKeywords.UInt, intTypes.uint32);
PredefinedType.registerType(TypeKeywords.UInt32, intTypes.uint32);

PredefinedType.registerType(TypeKeywords.Long, intTypes.int64);
PredefinedType.registerType(TypeKeywords.Int64, intTypes.int64);
PredefinedType.registerType(TypeKeywords.ULong, intTypes.uint64);
PredefinedType.registerType(TypeKeywords.UInt64, intTypes.uint64);
