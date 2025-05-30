import {ExpressionType} from "../../expressions";
import {Handler} from "../../common/handler";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type ThrowStatementType = {
    type: "ThrowStatement",
    expr: ExpressionType | null
}

export class ThrowHandler extends Handler {
    public value: ThrowStatementType;

    private exprHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler
        ];
    }

    public _handle(node: any): void {
        super._handle(node);
        if (node.expr) {
            this.exprHandler = Handler.handle(node.expr, this.context);
        } else {
            this.exprHandler = null;
        }
        this.value = {
            type: "ThrowStatement",
            expr: this.exprHandler?.value
        }
    }
}

Handler.registerHandler("ThrowStatement", ThrowHandler);
