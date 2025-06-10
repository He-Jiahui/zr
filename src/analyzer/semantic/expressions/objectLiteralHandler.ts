import {KeyValuePair, ObjectLiteral} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import type {StringType} from "../literals/stringHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "./types";

export type ObjectLiteralType = {
    type: Keywords.ObjectLiteralExpression,
    properties: KeyValuePairType[]
}

export class ObjectLiteralHandler extends Handler {
    public value: ObjectLiteralType;
    private readonly propertiesHandler: Handler[] = [];

    public _handle(node: ObjectLiteral): void {
        super._handle(node);
        this.propertiesHandler.length = 0;
        for (const property of node.properties) {
            const handler = Handler.handle(property, this.context);
            this.propertiesHandler.push(handler);
        }
        this.value = {
            type: Keywords.ObjectLiteralExpression,
            properties: this.propertiesHandler.map(handler => handler?.value)
        };
    }
}

Handler.registerHandler(Keywords.ObjectLiteral, ObjectLiteralHandler);

export type KeyValuePairType = {
    type: Keywords.KeyValuePairExpression,
    key: IdentifierType | StringType | ExpressionType,
    value: ExpressionType
}


export class KeyValuePairHandler extends Handler {
    public value: KeyValuePairType;

    private keyHandler: TNullable<Handler> = null;
    private valueHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.keyHandler,
            this.valueHandler
        ];
    }

    public _handle(node: KeyValuePair): void {
        super._handle(node);
        this.keyHandler = Handler.handle(node.key, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: Keywords.KeyValuePairExpression,
            key: this.keyHandler?.value,
            value: this.valueHandler?.value
        };
    }
}

Handler.registerHandler(Keywords.KeyValuePair, KeyValuePairHandler);
