import { LambdaExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"
import type { BlockType } from "../statements/blockHandler"
import type { ParameterType } from "../types/parameterHandler"

export type LambdaType = {
    type: 'LambdaExpression',
    params: ParameterType[],
    args: ParameterType,
    blocks: BlockType,
}

export class LambdaHandler extends Handler{
    public value: LambdaType;
    private readonly paramsHandler: Handler[] = [];
    private argsHandler: Handler | null = null;
    private blockHandler: Handler | null = null;
    
    public handle(node: LambdaExpression): void {
        super.handle(node);
        this.paramsHandler.length = 0;
        for(const param of node.params){
            const handler = Handler.handle(param, this.context);
            this.paramsHandler.push(handler);
        }
        if(node.args){
            this.argsHandler = Handler.handle(node.args, this.context);
        }else{
            this.argsHandler = null;
        }

        this.blockHandler = Handler.handle(node.block, this.context);

        this.value = {
            type: 'LambdaExpression',
            params: this.paramsHandler.map(handler => handler?.value as ParameterType),
            args: this.argsHandler?.value as ParameterType,
            blocks: this.blockHandler?.value
        }
    }
}

Handler.registerHandler("LambdaExpression", LambdaHandler);