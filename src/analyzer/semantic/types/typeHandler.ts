import { Handler } from "../common/handler";

export type TypeType = {
    type: "Type",
    name: string
}

export class TypeHandler extends Handler{
    public value: TypeType;
    public handle(node: {type: "Type", name: string, location: any}) {
        super.handle(node);
        this.value = {
            type: "Type",
            name: node.name,
        };
    }
}

Handler.registerHandler("Type", TypeHandler);