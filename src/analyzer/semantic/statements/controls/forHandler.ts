import { ForeachLoop, ForLoop } from "../../../../parser/generated/parser"
import { Handler } from "../../common/handler"
import type { IdentifierType } from "../../declarations/identifierHandler"
import type { DestructuringArrayType, DestructuringObjectType } from "../../declarations/variable/destructuringHandler"
import type { VariableType } from "../../declarations/variable/variableHandler"
import type { ExpressionType } from "../../expressions"
import type { AllType } from "../../types/types"
import type { BlockType } from "../blockHandler"
import type { ExpressionStatementType } from "../expressionHandler"

export type ForLoopStatementType = {
    type:"ForLoopStatement",
    init: VariableType | null,
    condition: ExpressionStatementType | null,
    step: ExpressionType | null,
    block: BlockType
}

export class ForLoopStatementHandler extends Handler{
    public value: ForLoopStatementType;
    private initHandler: Handler | null = null;
    private conditionHandler: Handler | null = null;
    private stepHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public handle(node: ForLoop): void {
        super.handle(node);
        if(node.init !== ";"){
            this.initHandler = Handler.handle(node.init, this.context);
        }else{
            this.initHandler = null;
        }
        if(node.cond !== ";"){
            this.conditionHandler = Handler.handle(node.cond, this.context);
        }else{
            this.conditionHandler = null;
        }
        if(node.step){
            this.stepHandler = Handler.handle(node.step, this.context);
        }else{
            this.stepHandler = null;
        }
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type:"ForLoopStatement",
            init: this.initHandler?.value as VariableType | null,
            condition: this.conditionHandler?.value as ExpressionStatementType | null,
            step: this.stepHandler?.value as ExpressionType | null,
            block: this.blockHandler.value as BlockType
        }
    }
}

Handler.registerHandler("ForLoop", ForLoopStatementHandler);

export type ForeachLoopStatementType = {
    type:"ForeachLoopStatement",
    pattern: DestructuringObjectType | DestructuringArrayType | IdentifierType,
    typeInfo: AllType | null,
    expr: ExpressionType,
    block: BlockType
}

export class ForeachLoopStatementHandler extends Handler{
    public value: ForeachLoopStatementType;
    private patternHandler: Handler | null = null;
    private typeHandler: Handler | null = null;
    private exprHandler: Handler | null = null;
    private blockHandler: Handler | null = null;

    public handle(node: ForeachLoop): void {
        super.handle(node);
        this.patternHandler = Handler.handle(node.pattern, this.context);

        if(node.typeInfo){
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        }
        this.exprHandler = Handler.handle(node.expr, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type:"ForeachLoopStatement",
            pattern: this.patternHandler.value as DestructuringObjectType | DestructuringArrayType | IdentifierType,
            typeInfo: this.typeHandler?.value as AllType | null,
            expr: this.exprHandler.value as ExpressionType,
            block: this.blockHandler.value as BlockType
        }
    }
}

Handler.registerHandler("ForeachLoop", ForeachLoopStatementHandler);