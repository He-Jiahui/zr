import {Handler} from "../../common/handler";
import type {ExpressionType} from "../../expressions";
import {BreakContinueStatement} from "../../../../parser/generated/parser";

export type BreakContinueStatementType = {
    type: "BreakContinueStatement",
    isContinue: boolean,
    expr: ExpressionType | null
}

export class BreakContinueHandler extends Handler {
    public value: BreakContinueStatementType;

    private exprHandler: Handler | null = null;

    public _handle(node: BreakContinueStatement): void {
        super._handle(node);
        if (node.expr) {
            this.exprHandler = Handler.handle(node.expr, this.context);
        } else {
            this.exprHandler = null;
        }
        this.value = {
            type: "BreakContinueStatement",
            isContinue: !node.isBreak,
            expr: this.exprHandler?.value
        }
    }
}

Handler.registerHandler("BreakContinueStatement", BreakContinueHandler);