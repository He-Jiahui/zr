import {ForeachLoop, ForLoop} from "../../../parser/generated/parser"
import {Handler} from "../common/handler"
import type {IdentifierType} from "../declarations/identifierHandler"
import type {DestructuringArrayType, DestructuringObjectType} from "../declarations/variable/destructuringHandler"
import type {VariableType} from "../declarations/variable/variableHandler"
import type {ExpressionType} from "./index"
import type {AllType} from "../types/types"
import type {BlockType} from "../statements/blockHandler"
import type {ExpressionStatementType} from "../statements/expressionHandler"

export type ForLoopExpressionType = {
    type: "ForLoopExpression",
    isStatement: boolean,
    init: VariableType | null,
    condition: ExpressionStatementType | null,
    step: ExpressionType | null,
    block: BlockType
}

export class ForLoopExpressionHandler extends Handler {
    public value: ForLoopExpressionType;
    private initHandler: Handler | null = null;
    private conditionHandler: Handler | null = null;
    private stepHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public _handle(node: ForLoop): void {
        super._handle(node);
        if (node.init !== ";") {
            this.initHandler = Handler.handle(node.init, this.context);
        } else {
            this.initHandler = null;
        }
        if (node.cond !== ";") {
            this.conditionHandler = Handler.handle(node.cond, this.context);
        } else {
            this.conditionHandler = null;
        }
        if (node.step) {
            this.stepHandler = Handler.handle(node.step, this.context);
        } else {
            this.stepHandler = null;
        }
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: "ForLoopExpression",
            isStatement: node.isStatement,
            init: this.initHandler?.value as VariableType | null,
            condition: this.conditionHandler?.value as ExpressionStatementType | null,
            step: this.stepHandler?.value as ExpressionType | null,
            block: this.blockHandler.value as BlockType
        }
    }
}

Handler.registerHandler("ForLoop", ForLoopExpressionHandler);

export type ForeachLoopExpressionType = {
    type: "ForeachLoopExpression",
    isStatement: boolean,
    pattern: DestructuringObjectType | DestructuringArrayType | IdentifierType,
    typeInfo: AllType | null,
    expr: ExpressionType,
    block: BlockType
}

export class ForeachLoopExpressionHandler extends Handler {
    public value: ForeachLoopExpressionType;
    private patternHandler: Handler | null = null;
    private typeHandler: Handler | null = null;
    private exprHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public _handle(node: ForeachLoop): void {
        super._handle(node);
        this.patternHandler = Handler.handle(node.pattern, this.context);

        if (node.typeInfo) {
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        }
        this.exprHandler = Handler.handle(node.expr, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: "ForeachLoopExpression",
            isStatement: node.isStatement,
            pattern: this.patternHandler.value as DestructuringObjectType | DestructuringArrayType | IdentifierType,
            typeInfo: this.typeHandler?.value as AllType | null,
            expr: this.exprHandler.value as ExpressionType,
            block: this.blockHandler.value as BlockType
        }
    }
}

Handler.registerHandler("ForeachLoop", ForeachLoopExpressionHandler);