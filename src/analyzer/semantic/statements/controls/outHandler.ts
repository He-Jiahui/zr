import {Handler} from "../../common/handler";
import type {ExpressionType} from "../../expressions";
import {OutStatement} from "../../../../parser/generated/parser";

export type OutStatementType = {
    type: "OutStatement",
    expr: ExpressionType | null
}

export class OutHandler extends Handler {
    public value: OutStatementType;

    private exprHandler: Handler | null = null;

    public _handle(node: OutStatement): void {
        super._handle(node);
        if (node.expr) {
            this.exprHandler = Handler.handle(node.expr, this.context);
        } else {
            this.exprHandler = null;
        }
        this.value = {
            type: "OutStatement",
            expr: this.exprHandler?.value
        }
    }
}

Handler.registerHandler("OutStatement", OutHandler);