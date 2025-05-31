import {PredefinedType} from "./predefinedType";

export class IntType extends PredefinedType {
    public readonly name: string = "int";

    public readonly unsigned: boolean;
    public readonly size: number;

    public constructor(unsigned: boolean, size: number) {
        super();
        this.unsigned = unsigned;
        this.size = size;
    }

    protected get _typeName(): string {
        return `${this.unsigned ? "u" : ""}int${this.size}`;
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


PredefinedType.registerType("char", intTypes.int8);
PredefinedType.registerType("int8", intTypes.int8);
PredefinedType.registerType("byte", intTypes.uint8);
PredefinedType.registerType("uint8", intTypes.uint8);

PredefinedType.registerType("short", intTypes.int16);
PredefinedType.registerType("int16", intTypes.int16);
PredefinedType.registerType("ushort", intTypes.uint16);
PredefinedType.registerType("uint16", intTypes.uint16);

PredefinedType.registerType("int", intTypes.int32);
PredefinedType.registerType("int32", intTypes.int32);
PredefinedType.registerType("uint", intTypes.uint32);
PredefinedType.registerType("uint32", intTypes.uint32);

PredefinedType.registerType("long", intTypes.int64);
PredefinedType.registerType("int64", intTypes.int64);
PredefinedType.registerType("ulong", intTypes.uint64);
PredefinedType.registerType("uint64", intTypes.uint64);
