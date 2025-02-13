import type { ExpressionType } from ".";
import { KeyValuePair, ObjectLiteral } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"
import type { IdentifierType } from "../declarations/identifierHandler";
import type { StringType } from "../literals/stringHandler";

export type ObjectLiteralType = {
    type: 'ObjectLiteralExpression',
    properties: KeyValuePairType[]
}

export class ObjectLiteralHandler extends Handler{
    private readonly propertiesHandler : Handler[] = [];

    public value: ObjectLiteralType;

    public handle(node: ObjectLiteral): void {
        super.handle(node);
        this.propertiesHandler.length = 0;
        for(const property of node.properties){
            const handler = Handler.handle(property, this.context);
            this.propertiesHandler.push(handler);
        }
        this.value = {
            type: 'ObjectLiteralExpression',
            properties: this.propertiesHandler.map(handler => handler?.value)
        }
    }
}

Handler.registerHandler("ObjectLiteral", ObjectLiteralHandler);

export type KeyValuePairType = {
    type: 'KeyValuePairExpression',
    key: IdentifierType | StringType | ExpressionType,
    value: ExpressionType
}


export class KeyValuePairHandler extends Handler{
    public value: KeyValuePairType;

    private keyHandler: Handler|null = null;
    private valueHandler: Handler|null = null

    public handle(node: KeyValuePair): void {
        super.handle(node);
        this.keyHandler = Handler.handle(node.key, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: 'KeyValuePairExpression',
            key: this.keyHandler?.value,
            value: this.valueHandler?.value
        }
    }
}

Handler.registerHandler("KeyValuePair", KeyValuePairHandler);