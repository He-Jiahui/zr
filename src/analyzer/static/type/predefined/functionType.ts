import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class FunctionType extends PredefinedType {
    public readonly name: string = TypeKeywords.Function;

    protected get _typeName(): string {
        return TypeKeywords.Function;
    }
}


PredefinedType.registerType(TypeKeywords.Function, new FunctionType());
