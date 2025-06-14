import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class ArrayType extends PredefinedType {
    public readonly name: string = TypeKeywords.Array;

    protected readonly _isGeneric = true;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return TypeKeywords.Array;
    }
}

PredefinedType.registerType(TypeKeywords.Array, new ArrayType());
