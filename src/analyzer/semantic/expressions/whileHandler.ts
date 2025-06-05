import {WhileLoop} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {ExpressionType} from "./index";
import {BlockType} from "../statements/blockHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type WhileLoopExpressionType = {
    type: Keywords.WhileLoopExpression,
    isStatement: boolean,
    condition: ExpressionType,
    block: BlockType
}

export class WhileLoopExpressionHandler extends Handler {
    public value: WhileLoopExpressionType;
    private conditionHandler: TNullable<Handler> = null;
    private blockHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.conditionHandler,
            this.blockHandler
        ];
    }

    public _handle(node: WhileLoop): void {
        super._handle(node);
        this.conditionHandler = Handler.handle(node.cond, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: Keywords.WhileLoopExpression,
            isStatement: node.isStatement,
            condition: this.conditionHandler?.value,
            block: this.blockHandler?.value
        }
    }

}

Handler.registerHandler(Keywords.WhileLoop, WhileLoopExpressionHandler);
