import {PredefinedType} from "./predefinedType";

export class BufferType extends PredefinedType {
    public readonly name: string = "buffer";

    protected get _typeName(): string {
        return "buffer";
    }
}

PredefinedType.registerType("buffer", new BufferType());
