import type {ExpressionType} from ".";
import {DecoratorExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {Symbol, SymbolOrSymbolSet} from "../../static/symbol/symbol";

export type DecoratorExpressionType = {
    type: 'DecoratorExpression',
    expr: ExpressionType,
}

export class DecoratorExpressionHandler extends Handler {
    public value: DecoratorExpressionType;
    private exprHandler: Handler | null = null;

    public _handle(node: DecoratorExpression): void {
        super._handle(node);

        this.exprHandler = Handler.handle(node.expr, this.context);
        this.value = {
            type: 'DecoratorExpression',
            expr: this.exprHandler?.value as ExpressionType
        }
    }

    protected _collectDeclarations() {
        // if there is a block in expression
        const handler = Handler.getHandler(this.value.expr);
        return handler?.collectDeclarations();
    }
}

Handler.registerHandler("DecoratorExpression", DecoratorExpressionHandler);
