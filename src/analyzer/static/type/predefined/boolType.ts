import {PredefinedType} from "./predefinedType";

export class BoolType extends PredefinedType {
    public readonly name: string = "bool";
    public readonly size: number = 1;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return "bool";
    }
}

PredefinedType.registerType("bool", new BoolType());
