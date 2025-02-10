import type { Expression } from ".";
import { IfExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import type { BlockType } from "../statements/blockHandler";

export type IfExpressionType = {
    type: "IfExpression",
    condition: Expression,
    then: BlockType,
    else: BlockType | IfExpressionType | null
}

export class IfExpressionHandler extends Handler{
    public value: IfExpressionType;
    private conditionHandler: Handler | null = null;
    private thenHandler: Handler | null = null;
    private elseHandler: Handler | null = null;

    public handle(node: IfExpression): void {
        super.handle(node);
        this.conditionHandler = Handler.handle(node.condition, this.context);
        this.thenHandler = Handler.handle(node.then, this.context);
        if(node.else){
            this.elseHandler = Handler.handle(node.else, this.context);
        }else{
            this.elseHandler = null;
        }

        this.value = {
            type: "IfExpression",
            condition: this.conditionHandler?.value as Expression,
            then: this.thenHandler?.value as BlockType,
            else: this.elseHandler?.value as BlockType | IfExpressionType | null
        }
    }
}

Handler.registerHandler("IfExpression", IfExpressionHandler);