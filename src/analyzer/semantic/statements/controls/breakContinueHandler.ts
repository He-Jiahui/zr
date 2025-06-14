import {Handler} from "../../common/handler";
import {BreakContinueStatement} from "../../../../parser/generated/parser";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import type {ExpressionType} from "../../expressions/types";

export type BreakContinueStatementType = {
    type: Keywords.BreakContinueStatement,
    isContinue: boolean,
    expr: ExpressionType | null
}

export class BreakContinueHandler extends Handler {
    public value: BreakContinueStatementType;

    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

    public _handle(node: BreakContinueStatement): void {
        super._handle(node);
        if (node.expr) {
            this.exprHandler = Handler.handle(node.expr, this.context);
        } else {
            this.exprHandler = null;
        }
        this.value = {
            type: Keywords.BreakContinueStatement,
            isContinue: !node.isBreak,
            expr: this.exprHandler?.value
        };
    }
}

Handler.registerHandler(Keywords.BreakContinueStatement, BreakContinueHandler);
