import {ReturnStatement} from "../../../../parser/generated/parser";
import {Handler} from "../../common/handler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import type {ExpressionType} from "../../expressions/types";

export type ReturnStatementType = {
    type: Keywords.ReturnStatement,
    expr: ExpressionType | null
}

export class ReturnStatementHandler extends Handler {
    public value: ReturnStatementType;

    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

    public _handle(node: ReturnStatement): void {
        super._handle(node);
        if (node.expr) {
            this.exprHandler = Handler.handle(node.expr, this.context);
        } else {
            this.exprHandler = null;
        }
        this.value = {
            type: Keywords.ReturnStatement,
            expr: this.exprHandler?.value
        };
    }
}

Handler.registerHandler(Keywords.ReturnStatement, ReturnStatementHandler);
