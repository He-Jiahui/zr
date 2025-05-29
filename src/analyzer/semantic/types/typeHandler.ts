import {Type} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import {GenericType} from "./genericHandler";
import {TupleType} from "./tupleHandler";
import {TNullable} from "../../utils/zrCompilerTypes";

export type TypeType = {
    type: "Type",
    name: IdentifierType | GenericType | TupleType,
    dimensions: number
}

export class TypeHandler extends Handler {
    public value: TypeType;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler
        ];
    }

    public _handle(node: Type) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        this.value = {
            type: "Type",
            name: this.nameHandler?.value,
            dimensions: node.dimensions
        };
    }
}

Handler.registerHandler("Type", TypeHandler);
