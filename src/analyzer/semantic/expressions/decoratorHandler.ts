import type {ExpressionType} from ".";
import {DecoratorExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type DecoratorExpressionType = {
    type: Keywords.DecoratorExpression,
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
            type: Keywords.DecoratorExpression,
            expr: this.exprHandler?.value as ExpressionType
        }
    }
}

Handler.registerHandler(Keywords.DecoratorExpression, DecoratorExpressionHandler);
