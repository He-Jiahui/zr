import type {ExpressionType} from ".";
import {IfExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {BlockType} from "../statements/blockHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type IfExpressionType = {
    type: Keywords.IfExpression,
    isStatement: boolean,
    condition: ExpressionType,
    then: BlockType,
    else: BlockType | IfExpressionType | null
}

export class IfExpressionHandler extends Handler {
    public value: IfExpressionType;
    private conditionHandler: TNullable<Handler> = null;
    private thenHandler: TNullable<Handler> = null;
    private elseHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.conditionHandler,
            this.thenHandler,
            this.elseHandler
        ];
    }

    public _handle(node: IfExpression): void {
        super._handle(node);
        this.conditionHandler = Handler.handle(node.condition, this.context);
        this.thenHandler = Handler.handle(node.then, this.context);
        if (node.else) {
            this.elseHandler = Handler.handle(node.else, this.context);
        } else {
            this.elseHandler = null;
        }

        this.value = {
            type: Keywords.IfExpression,
            isStatement: node.isStatement,
            condition: this.conditionHandler?.value as ExpressionType,
            then: this.thenHandler?.value as BlockType,
            else: this.elseHandler?.value as BlockType | IfExpressionType | null
        }
    }
}

Handler.registerHandler(Keywords.IfExpression, IfExpressionHandler);
