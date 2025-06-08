import {IDENTIFIER} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import {Keywords} from "../../../types/keywords";

export type IdentifierType = {
    type: Keywords.Identifier,
    name: string,
}

export class IdentifierHandler extends Handler {

    public value: IdentifierType;

    public _handle(node: IDENTIFIER): void {
        super._handle(node);
        this.value = {
            type: Keywords.Identifier,
            name: node.name
        }
    }

}

Handler.registerHandler(Keywords.Identifier, IdentifierHandler);
