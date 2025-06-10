import {MetaIdentifier} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "./identifierHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type MetaType = {
    type: Keywords.Meta,
    name: IdentifierType;
}

export class MetaHandler extends Handler {
    public value: MetaType;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler
        ];
    }

    public _handle(node: MetaIdentifier): void {
        this.nameHandler = Handler.handle(node.name, this.context);
        this.value = {
            type: Keywords.Meta,
            name: this.nameHandler?.value
        };
    }
}

Handler.registerHandler(Keywords.Meta, MetaHandler);
