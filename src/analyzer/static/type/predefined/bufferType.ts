import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class BufferType extends PredefinedType {
    public readonly name: string = TypeKeywords.Buffer;

    protected get _typeName(): string {
        return TypeKeywords.Buffer;
    }
}

PredefinedType.registerType(TypeKeywords.Buffer, new BufferType());
