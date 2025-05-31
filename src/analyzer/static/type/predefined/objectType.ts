import {PredefinedType} from "./predefinedType";

export class ObjectType extends PredefinedType {
    public readonly name: string = "object";

    public constructor() {
        super();
    }

    protected get _typeName(): string {
        return "object";
    }

}
