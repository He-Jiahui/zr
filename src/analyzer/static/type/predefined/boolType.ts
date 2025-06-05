import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class BoolType extends PredefinedType {
    public readonly name: string = TypeKeywords.Boolean;
    public readonly size: number = 1;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return TypeKeywords.Boolean;
    }
}

PredefinedType.registerType(TypeKeywords.Boolean, new BoolType());
