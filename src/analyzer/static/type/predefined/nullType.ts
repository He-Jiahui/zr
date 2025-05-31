import {PredefinedType} from "./predefinedType";

export class NullType extends PredefinedType {
    public readonly name: string = "null";

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return "null";
    }
}

const nullType = new NullType();

PredefinedType.registerType("null", nullType);
PredefinedType.registerType("void", nullType);
