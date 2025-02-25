import { SwitchCase, SwitchStatement } from "../../../../parser/generated/parser"
import { Handler } from "../../common/handler"
import type { ExpressionType } from "../../expressions"
import type { BlockType } from "../blockHandler"

export type SwitchStatementType = {
    type: "SwitchStatement",
    cases: SwitchCaseType[],
    default: SwitchDefaultType | null
}

export class SwitchStatementHandler extends Handler{
    public value: SwitchStatementType;

    private readonly caseHandlers: Handler[] = [];
    private defaultHandler: Handler | null = null;

    public _handle(node: SwitchStatement): void {
        super._handle(node);

        this.caseHandlers.length = 0;
        for(const caseNode of node.cases){
            const handler = Handler.handle(caseNode, this.context);
            this.caseHandlers.push(handler);
        }

        if(node.default){
            this.defaultHandler = Handler.handle(node.default, this.context);
        }else{
            this.defaultHandler = null;
        }

        this.value = {
            type: "SwitchStatement",
            cases: this.caseHandlers.map(handler => handler?.value as SwitchCaseType),
            default: this.defaultHandler?.value as SwitchDefaultType | null
        }
    }

}

Handler.registerHandler("SwitchStatement", SwitchStatementHandler);

export type SwitchCaseType = {
    type: "SwitchCase",
    test: ExpressionType,
    block: BlockType
}

export class SwitchCaseHandler extends Handler{
    public value: SwitchCaseType;

    private testHandler: Handler| null = null;
    private blockHandler: Handler | null = null;

    public _handle(node: SwitchCase): void {
        super._handle(node);

        this.testHandler = Handler.handle(node.value, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);

        this.value = {
            type: "SwitchCase",
            test: this.testHandler.value,
            block: this.blockHandler.value
        }
    }
}

Handler.registerHandler("SwitchCase", SwitchCaseHandler);

export type SwitchDefaultType = {
    type: "SwitchDefault",
    block: BlockType
}

export class SwitchDefaultHandler extends Handler{
    public value: SwitchDefaultType;

    private blockHandler: Handler | null = null;

    public _handle(node: SwitchDefaultType): void {
        super._handle(node);

        this.blockHandler = Handler.handle(node.block, this.context);

        this.value = {
            type: "SwitchDefault",
            block: this.blockHandler?.value
        }
    }
}

Handler.registerHandler("SwitchDefault", SwitchDefaultHandler);