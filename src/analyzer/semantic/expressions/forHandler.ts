import {ForeachLoop, ForLoop} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import type {DestructuringArrayType, DestructuringObjectType} from "../declarations/variable/destructuringHandler";
import type {VariableType} from "../declarations/variable/variableHandler";
import type {AllType} from "../types/types";
import type {BlockType} from "../statements/blockHandler";
import type {ExpressionStatementType} from "../statements/expressionHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "./types";

export type ForLoopExpressionType = {
    type: Keywords.ForLoopExpression,
    isStatement: boolean,
    init: VariableType | null,
    condition: ExpressionStatementType | null,
    step: ExpressionType | null,
    block: BlockType
}

export class ForLoopExpressionHandler extends Handler {
    public value: ForLoopExpressionType;
    private initHandler: TNullable<Handler> = null;
    private conditionHandler: TNullable<Handler> = null;
    private stepHandler: TNullable<Handler> = null;
    private blockHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.initHandler,
            this.conditionHandler,
            this.stepHandler,
            this.blockHandler
        ];
    }

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
            type: Keywords.ForLoopExpression,
            isStatement: node.isStatement,
            init: this.initHandler?.value as VariableType | null,
            condition: this.conditionHandler?.value as ExpressionStatementType | null,
            step: this.stepHandler?.value as ExpressionType | null,
            block: this.blockHandler.value as BlockType
        };
    }
}

Handler.registerHandler(Keywords.ForLoop, ForLoopExpressionHandler);

export type ForeachLoopExpressionType = {
    type: Keywords.ForeachLoopExpression,
    isStatement: boolean,
    pattern: DestructuringObjectType | DestructuringArrayType | IdentifierType,
    typeInfo: AllType | null,
    expr: ExpressionType,
    block: BlockType
}

export class ForeachLoopExpressionHandler extends Handler {
    public value: ForeachLoopExpressionType;
    private patternHandler: TNullable<Handler> = null;
    private typeHandler: TNullable<Handler> = null;
    private exprHandler: TNullable<Handler> = null;
    private blockHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.patternHandler,
            this.typeHandler,
            this.exprHandler,
            this.blockHandler
        ];
    }

    public _handle(node: ForeachLoop): void {
        super._handle(node);
        this.patternHandler = Handler.handle(node.pattern, this.context);

        if (node.typeInfo) {
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        }
        this.exprHandler = Handler.handle(node.expr, this.context);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.value = {
            type: Keywords.ForeachLoopExpression,
            isStatement: node.isStatement,
            pattern: this.patternHandler.value as DestructuringObjectType | DestructuringArrayType | IdentifierType,
            typeInfo: this.typeHandler?.value as AllType | null,
            expr: this.exprHandler.value as ExpressionType,
            block: this.blockHandler.value as BlockType
        };
    }
}

Handler.registerHandler(Keywords.ForeachLoop, ForeachLoopExpressionHandler);
