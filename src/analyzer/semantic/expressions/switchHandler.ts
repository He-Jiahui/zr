import type { Expression } from "."
import { SwitchExpression } from "../../../parser/generated/parser"
import { Handler } from "../common/handler"
import type { SwitchCaseType, SwitchDefaultType } from "../statements/controls/switchHandler"

export type SwitchExpressionType = {
    type: "SwitchExpression",
    expr: Expression,
    cases: SwitchCaseType[],
    default: SwitchDefaultType | null
}


export class SwitchExpressionHandler extends Handler{
    public value: SwitchExpressionType;
    
    private exprHandler: Handler | null = null;
    private readonly caseHandlers: Handler[] = [];
    private defaultHandler: Handler | null = null;

    public handle(node: SwitchExpression): void {
        super.handle(node);
        this.caseHandlers.length = 0;
        this.exprHandler = Handler.handle(node.expr, this.context);
        for(const $case of node.cases){
            const handler = Handler.handle($case, this.context);
            this.caseHandlers.push(handler);
        }
        if(node.default){
            this.defaultHandler = Handler.handle(node.default, this.context);
        }else{
            this.defaultHandler = null;
        }

        this.value = {
            type: "SwitchExpression",
            expr: this.exprHandler?.value,
            cases: this.caseHandlers.map(handler => handler?.value),
            default: this.defaultHandler?.value
        }
    }
}

Handler.registerHandler("SwitchExpression", SwitchExpressionHandler);