import { ReturnStatement } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler"
import type { ExpressionType } from "../../expressions"

export type ReturnStatementType = {
    type: "ReturnStatement",
    expr: ExpressionType | null
}

export class ReturnStatementHandler extends Handler{
    public value: ReturnStatementType;

    private exprHandler: Handler | null = null;

    public _handle(node: ReturnStatement): void {
        super._handle(node);
        if(node.expr){
            this.exprHandler = Handler.handle(node.expr, this.context);
        }else{
            this.exprHandler = null;
        }
        this.value = {
            type: "ReturnStatement",
            expr: this.exprHandler?.value
        }
    }
}

Handler.registerHandler("ReturnStatement", ReturnStatementHandler);