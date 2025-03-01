import {WhileLoop} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import {ExpressionType} from "./index";
import {BlockType} from "../statements/blockHandler";

export type WhileLoopExpressionType = {
    type: "WhileLoopExpression",
    isStatement: boolean,
    condition: ExpressionType,
    block: BlockType
}

export class WhileLoopExpressionHandler extends Handler {
    public value: WhileLoopExpressionType;
    private conditionHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public _handle(node: WhileLoop): void {
        super._handle(node);
        this.conditionHandler = Handler.handle(node.cond, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: "WhileLoopExpression",
            isStatement: node.isStatement,
            condition: this.conditionHandler?.value,
            block: this.blockHandler?.value
        }
    }

}

Handler.registerHandler("WhileLoop", WhileLoopExpressionHandler);
