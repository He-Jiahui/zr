import type {ExpressionType} from ".";
import {DecoratorExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {TNullable} from "../../utils/zrCompilerTypes";

export type DecoratorExpressionType = {
    type: 'DecoratorExpression',
    expr: ExpressionType,
}

export class DecoratorExpressionHandler extends Handler {
    public value: DecoratorExpressionType;
    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

    public _handle(node: DecoratorExpression): void {
        super._handle(node);

        this.exprHandler = Handler.handle(node.expr, this.context);
        this.value = {
            type: 'DecoratorExpression',
            expr: this.exprHandler?.value as ExpressionType
        }
    }
}

Handler.registerHandler("DecoratorExpression", DecoratorExpressionHandler);
