import { LambdaExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"
import type { BlockType } from "../statements/blockHandler"
import type { ParameterType } from "../types/parameterHandler"

export type LambdaType = {
    type: 'LambdaExpression',
    args: ParameterType[],
    blocks: BlockType,
}

export class LambdaHandler extends Handler{
    public value: LambdaType;
    private readonly argsHandler: Handler[] = [];
    private blockHandler: Handler | null = null;
    
    public handle(node: LambdaExpression): void {
        super.handle(node);
        this.argsHandler.length = 0;
        for(const arg of node.args){
            const handler = Handler.handle(arg, this.context);
            this.argsHandler.push(handler);
        }

        this.blockHandler = Handler.handle(node.block, this.context);

        this.value = {
            type: 'LambdaExpression',
            args: this.argsHandler.map(handler => handler?.value as ParameterType),
            blocks: this.blockHandler?.value
        }
    }
}

Handler.registerHandler("LambdaExpression", LambdaHandler);