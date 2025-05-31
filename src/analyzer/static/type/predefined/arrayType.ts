import {PredefinedType} from "./predefinedType";

export class ArrayType extends PredefinedType {
    public readonly name: string = "array";

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return "array";
    }
}

PredefinedType.registerType("array", new ArrayType());
