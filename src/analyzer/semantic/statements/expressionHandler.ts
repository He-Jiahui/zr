import {ExpressionStatement} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "../expressions/types";

export type ExpressionStatementType = {
    type: Keywords.ExpressionStatement;
    expr: ExpressionType;
}

export class ExpressionStatementHandler extends Handler {
    public value: ExpressionStatementType;

    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

    public _handle(node: ExpressionStatement): void {
        super._handle(node);
        this.exprHandler = Handler.handle(node.expr, this.context);
        this.value = {
            type: Keywords.ExpressionStatement,
            expr: this.exprHandler?.value as ExpressionType
        };
    }
}

Handler.registerHandler(Keywords.ExpressionStatement, ExpressionStatementHandler);
