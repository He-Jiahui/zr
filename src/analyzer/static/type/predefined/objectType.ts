import {PredefinedType} from "./predefinedType";
import {TypeKeywords} from "../../../../types/keywords";

export class ObjectType extends PredefinedType {
    public readonly name: string = TypeKeywords.Object;

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return TypeKeywords.Object;
    }

}

PredefinedType.registerType(TypeKeywords.Object, new ObjectType());

PredefinedType.registerType(TypeKeywords.Any, new ObjectType());
