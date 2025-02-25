import { WhileLoop } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import { ExpressionType } from "../../expressions";
import { BlockType } from "../blockHandler";

export type WhileLoopStatementType = {
    type: "WhileLoopStatement",
    condition: ExpressionType,
    block: BlockType
}

export class WhileLoopStatementHandler extends Handler{
    public value: WhileLoopStatementType;
    private conditionHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public _handle(node: WhileLoop): void {
        super._handle(node);
        this.conditionHandler = Handler.handle(node.cond, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: "WhileLoopStatement",
            condition: this.conditionHandler?.value,
            block: this.blockHandler?.value
        }
    }
    
}

Handler.registerHandler("WhileLoop", WhileLoopStatementHandler);
