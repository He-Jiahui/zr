import {Handler} from "../../common/handler";
import type {ExpressionType} from "../../expressions";
import {BreakContinueStatement} from "../../../../parser/generated/parser";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type BreakContinueStatementType = {
    type: "BreakContinueStatement",
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
            type: "BreakContinueStatement",
            isContinue: !node.isBreak,
            expr: this.exprHandler?.value
        }
    }
}

Handler.registerHandler("BreakContinueStatement", BreakContinueHandler);
