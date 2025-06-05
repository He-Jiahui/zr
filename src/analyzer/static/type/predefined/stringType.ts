import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class StringType extends PredefinedType {
    public readonly name: string = TypeKeywords.String;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return TypeKeywords.String;
    }
}

PredefinedType.registerType(TypeKeywords.String, new StringType());
