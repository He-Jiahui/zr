import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class FloatType extends PredefinedType {
    public readonly name: string = TypeKeywords.Float;
    public readonly size: number;

    public constructor(size: number) {
        super();
        this.size = size;
    }

    protected get _typeName(): string {
        return `${TypeKeywords.Float}${this.size}`;
    }

    public compareTo(otherType: FloatType): 0 | 1 | -1 {
        if (this.size > otherType.size) {
            return 1;
        }
        if (this.size === otherType.size) {
            return 0;
        }
        return -1;
    }
}

const floatTypes = {
    float32: new FloatType(32),
    float64: new FloatType(64)
};

PredefinedType.registerType(TypeKeywords.Float, floatTypes.float32);
PredefinedType.registerType(TypeKeywords.Float32, floatTypes.float32);
PredefinedType.registerType(TypeKeywords.Double, floatTypes.float64);
PredefinedType.registerType(TypeKeywords.Float64, floatTypes.float64);
