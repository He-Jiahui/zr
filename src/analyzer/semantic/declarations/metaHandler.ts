import { MetaIdentifier } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import type { IdentifierType } from "./identifierHandler"

export type MetaType = {
    type:"Meta",
    name: IdentifierType;
}

export class MetaHandler extends Handler{
    public value: MetaType;
    private nameHandler: Handler|null = null;

    public handle(node: MetaIdentifier): void {
        this.nameHandler = Handler.handle(node.name, this.context);
        this.value = {
            type: "Meta",
            name: this.nameHandler?.value
        }
    }
}

Handler.registerHandler("Meta", MetaHandler);