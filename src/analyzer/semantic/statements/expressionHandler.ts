import {ExpressionStatement} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {ExpressionType} from "../expressions";
import {TNullable} from "../../utils/zrCompilerTypes";

export type ExpressionStatementType = {
    type: 'ExpressionStatement';
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
            type: 'ExpressionStatement',
            expr: this.exprHandler?.value as ExpressionType
        }
    }
}

Handler.registerHandler("ExpressionStatement", ExpressionStatementHandler);
