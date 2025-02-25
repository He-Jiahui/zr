import { PrimaryExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"
import type { IdentifierType } from "../declarations/identifierHandler";
import type { LiteralType } from "../literals"
import type { ArrayLiteralType } from "./arrayLiteralHandler";
import { Exp } from "./expression";
import type { IfExpressionType } from "./ifHandler";
import type { LambdaType } from "./lambdaHandler";
import type { ObjectLiteralType } from "./objectLiteralHandler";
import type { SwitchExpressionType } from "./switchHandler";
export type LiteralExpressionType = ValueLiteralType | 
IdentifierLiteralType |
ObjectLiteralType |
ArrayLiteralType |
LambdaType |
IfExpressionType |
SwitchExpressionType;


export type ValueLiteralType = {
    type: "ValueLiteralExpression",
    value: LiteralType
}

export class ValueLiteralHandler extends Handler{
    public value: ValueLiteralType;

    private valueHandler: Handler | null;

    public _handle(node: Exp<PrimaryExpression,"ValueLiteral">){
        super._handle(node);
        this.valueHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: "ValueLiteralExpression",
            value: this.valueHandler?.value
        }
    }
}

Handler.registerHandler("ValueLiteral", ValueLiteralHandler);

export type IdentifierLiteralType = {
    type: "IdentifierLiteralExpression",
    value: IdentifierType
}

export class IdentifierLiteralHandler extends Handler{
    public value: IdentifierLiteralType;
    private identifierHandler: Handler | null = null;

    public _handle(node: Exp<PrimaryExpression,"IdentifierLiteral">){
        super._handle(node);
        this.identifierHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: "IdentifierLiteralExpression",
            value: this.identifierHandler?.value
        }
    }
}

Handler.registerHandler("IdentifierLiteral", IdentifierLiteralHandler);
