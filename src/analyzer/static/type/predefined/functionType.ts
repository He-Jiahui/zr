import {PredefinedType} from "./predefinedType";

export class FunctionType extends PredefinedType {
    public readonly name: string = "function";

    protected get _typeName(): string {
        return "function";
    }
}


PredefinedType.registerType("function", new FunctionType());
