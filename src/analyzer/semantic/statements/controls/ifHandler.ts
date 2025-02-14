import { IfStatement } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { ExpressionType } from "../../expressions";
import type { BlockType } from "../blockHandler";

export type IfStatementType = {
    type: "IfStatement",
    condition: ExpressionType,
    then: BlockType,
    else: BlockType | IfStatementType | null
}

export class IfStatementHandler extends Handler{
    public value: IfStatementType;

    private conditionHandler: Handler | null = null;
    private thenHandler: Handler | null = null;
    private elseHandler: Handler | null = null;

    public handle(node: IfStatement): void {
        super.handle(node);

        this.conditionHandler = Handler.handle(node.condition, this.context);
        this.thenHandler = Handler.handle(node.then, this.context);
        if(node.else){
            this.elseHandler = Handler.handle(node.else, this.context);
        }else{
            this.elseHandler = null;
        }

        this.value = {
            type: "IfStatement",
            condition: this.conditionHandler?.value as ExpressionType,
            then: this.thenHandler?.value as BlockType,
            else: this.elseHandler?.value as BlockType | IfStatementType | null
        }
    }
}

Handler.registerHandler("IfStatement", IfStatementHandler);