import {PredefinedType} from "./predefinedType";

export class StringType extends PredefinedType {
    public readonly name: string = "string";

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return "string";
    }
}

PredefinedType.registerType("string", new StringType());
