import {PrimaryExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import type {IdentifierType} from "../declarations/identifierHandler";
import type {LiteralType} from "../literals"
import type {ArrayLiteralType} from "./arrayLiteralHandler";
import type {IfExpressionType} from "./ifHandler";
import type {LambdaType} from "./lambdaHandler";
import type {ObjectLiteralType} from "./objectLiteralHandler";
import type {SwitchExpressionType} from "./switchHandler";
import type {ForeachLoopExpressionType, ForLoopExpressionType} from "./forHandler";
import type {WhileLoopExpressionType} from "./whileHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";

export type LiteralExpressionType = ValueLiteralType |
    IdentifierLiteralType |
    ObjectLiteralType |
    ArrayLiteralType |
    LambdaType |
    IfExpressionType |
    SwitchExpressionType |
    ForLoopExpressionType |
    ForeachLoopExpressionType |
    WhileLoopExpressionType;


export type ValueLiteralType = {
    type: "ValueLiteralExpression",
    value: LiteralType
}

export class ValueLiteralHandler extends Handler {
    public value: ValueLiteralType;

    private valueHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.valueHandler
        ];
    }

    public _handle(node: TExpression<PrimaryExpression, "ValueLiteral">) {
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

export class IdentifierLiteralHandler extends Handler {
    public value: IdentifierLiteralType;
    private identifierHandler: TNullable<Handler> = null;

    public _handle(node: TExpression<PrimaryExpression, "IdentifierLiteral">) {
        super._handle(node);
        this.identifierHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: "IdentifierLiteralExpression",
            value: this.identifierHandler?.value
        }
    }
}

Handler.registerHandler("IdentifierLiteral", IdentifierLiteralHandler);
