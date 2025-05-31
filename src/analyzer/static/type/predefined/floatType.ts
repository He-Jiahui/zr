import {PredefinedType} from "./predefinedType";

export class FloatType extends PredefinedType {
    public readonly name: string = "float";
    public readonly size: number;

    public constructor(size: number) {
        super();
        this.size = size;
    }

    protected get _typeName(): string {
        return `float${this.size}`;
    }
}

const floatTypes = {
    float32: new FloatType(32),
    float64: new FloatType(64)
};

PredefinedType.registerType("float", floatTypes.float32);
PredefinedType.registerType("float32", floatTypes.float32);

PredefinedType.registerType("double", floatTypes.float64);
PredefinedType.registerType("float64", floatTypes.float64);
