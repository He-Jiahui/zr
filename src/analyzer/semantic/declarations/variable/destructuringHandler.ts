import {DestructuringArrayPattern, DestructuringPattern} from "../../../../parser/generated/parser";
import {Handler} from "../../common/handler";
import type {IdentifierType} from "../identifierHandler";
import {Keywords} from "../../../../types/keywords";

export type DestructuringObjectType = {
    type: Keywords.DestructuringObject,
    keys: IdentifierType[]
}

export class DestructuringObjectHandler extends Handler {
    public value: DestructuringObjectType;
    private readonly keyHandlers: Handler[] = [];

    protected get _children() {
        return [
            ...this.keyHandlers
        ];
    }

    public _handle(node: DestructuringPattern): void {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: Keywords.DestructuringObject,
            keys: this.keyHandlers.map(handler => handler.value)
        };
    }
}

Handler.registerHandler(Keywords.DestructuringObject, DestructuringObjectHandler);

export type DestructuringArrayType = {
    type: Keywords.DestructuringArray,
    keys: IdentifierType[]
}

export class DestructuringArrayHandler extends Handler {
    public value: DestructuringArrayType;
    private readonly keyHandlers: Handler[] = [];

    protected get _children() {
        return [
            ...this.keyHandlers
        ];
    }

    public _handle(node: DestructuringArrayPattern): void {
        super._handle(node);
        this.keyHandlers.length = 0;
        for (const key of node.keys) {
            const handler = Handler.handle(key, this.context);
            this.keyHandlers.push(handler);
        }
        this.value = {
            type: Keywords.DestructuringArray,
            keys: this.keyHandlers.map(handler => handler.value)
        };
    }
}

Handler.registerHandler(Keywords.DestructuringArray, DestructuringArrayHandler);
