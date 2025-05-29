import {Handler} from "../../common/handler";
import type {ExpressionType} from "../../expressions";
import {OutStatement} from "../../../../parser/generated/parser";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type OutStatementType = {
    type: "OutStatement",
    expr: ExpressionType | null
}

export class OutHandler extends Handler {
    public value: OutStatementType;

    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

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
