import type {ExpressionType} from "."
import {SwitchCase, SwitchExpression} from "../../../parser/generated/parser"
import {Handler} from "../common/handler"
import type {BlockType} from "../statements/blockHandler"
import {TNullable} from "../../utils/zrCompilerTypes";

export type SwitchExpressionType = {
    type: "SwitchExpression",
    isStatement: boolean,
    expr: ExpressionType,
    cases: SwitchCaseType[],
    default: SwitchDefaultType | null
}


export class SwitchExpressionHandler extends Handler {
    public value: SwitchExpressionType;

    private exprHandler: TNullable<Handler> = null;
    private readonly caseHandlers: Handler[] = [];
    private defaultHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.exprHandler,
            ...this.caseHandlers,
            this.defaultHandler
        ];
    }

    public _handle(node: SwitchExpression): void {
        super._handle(node);
        this.caseHandlers.length = 0;
        this.exprHandler = Handler.handle(node.expr, this.context);
        for (const $case of node.cases) {
            const handler = Handler.handle($case, this.context);
            this.caseHandlers.push(handler);
        }
        if (node.default) {
            this.defaultHandler = Handler.handle(node.default, this.context);
        } else {
            this.defaultHandler = null;
        }

        this.value = {
            type: "SwitchExpression",
            isStatement: node.isStatement,
            expr: this.exprHandler?.value,
            cases: this.caseHandlers.map(handler => handler?.value),
            default: this.defaultHandler?.value
        }
    }
}

Handler.registerHandler("SwitchExpression", SwitchExpressionHandler);

export type SwitchCaseType = {
    type: "SwitchCase",
    test: ExpressionType,
    block: BlockType
}

export class SwitchCaseHandler extends Handler {
    public value: SwitchCaseType;

    private testHandler: TNullable<Handler> = null;
    private blockHandler: TNullable<Handler> = null;

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

export class SwitchDefaultHandler extends Handler {
    public value: SwitchDefaultType;

    private blockHandler: TNullable<Handler> = null;

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
