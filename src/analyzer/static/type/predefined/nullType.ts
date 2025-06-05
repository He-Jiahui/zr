import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class NullType extends PredefinedType {
    public readonly name: string = TypeKeywords.Null;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return TypeKeywords.Null;
    }
}

const nullType = new NullType();

PredefinedType.registerType(TypeKeywords.Null, nullType);
PredefinedType.registerType(TypeKeywords.Void, nullType);
