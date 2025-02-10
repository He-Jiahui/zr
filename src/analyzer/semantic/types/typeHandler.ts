import { IDENTIFIER } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import type { IdentifierType } from "../declarations/identifierHandler";

export type TypeType = {
    type: "Type",
    name: IdentifierType
}

export class TypeHandler extends Handler{
    public value: TypeType;
    private nameHandler: Handler|null = null;
    public handle(node: {type: "Type", name: IDENTIFIER, location: any}) {
        super.handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        this.value = {
            type: "Type",
            name: this.nameHandler?.value,
        };
    }
}

Handler.registerHandler("Type", TypeHandler);