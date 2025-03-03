import { DestructuringPattern } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler"
import type { IdentifierType } from "../identifierHandler"

export type DestructuringObjectType = {
    type:"DestructuringObject",
    keys: IdentifierType[]
}

export class DestructuringObjectHandler extends Handler{
    public value: DestructuringObjectType;
    private readonly keyHandlers: Handler[] = [];

    public _handle(node: DestructuringPattern): void {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: "DestructuringObject",
            keys: this.keyHandlers.map(handler => handler.value)
        }
    }
} 

Handler.registerHandler("DestructuringObject", DestructuringObjectHandler);

export type DestructuringArrayType = {
    type: "DestructuringArray",
    keys: IdentifierType[]
}

export class DestructuringArrayHandler extends Handler{
    public value: DestructuringArrayType;
    private readonly keyHandlers: Handler[] = [];

    public _handle(node: DestructuringPattern): void {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: "DestructuringArray",
            keys: this.keyHandlers.map(handler => handler.value)
        }
    }
}

Handler.registerHandler("DestructuringArray", DestructuringArrayHandler);