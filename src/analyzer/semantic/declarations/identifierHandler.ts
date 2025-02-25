import { IDENTIFIER } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"

export type IdentifierType = {
    type: "Identifier",
    name: string,
}

export class IdentifierHandler extends Handler{

    public value: IdentifierType;

    public _handle(node: IDENTIFIER): void {
        super._handle(node);
        this.value = {
            type: "Identifier",
            name: node.name
        }
    }   
}

Handler.registerHandler("Identifier", IdentifierHandler);