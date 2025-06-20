import {ConditionalExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {LogicalType} from "./logicalHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "./types";

export type ConditionalType = {
    type: Keywords.ConditionalExpression,
    condition: LogicalType,
    consequent: ExpressionType,
    alternate: ConditionalType
} | LogicalType;

export class ConditionalHandler extends Handler {
    public value: ConditionalType;
    private conditionHandler: TNullable<Handler> = null;
    private consequentHandler: TNullable<Handler> = null;
    private alternateHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.conditionHandler,
            this.consequentHandler,
            this.alternateHandler
        ];
    }

    public _handle(node: TExpression<ConditionalExpression, "Conditional">) {
        super._handle(node);
        this.conditionHandler = Handler.handle(node.test, this.context);
        this.consequentHandler = Handler.handle(node.consequent, this.context);
        this.alternateHandler = Handler.handle(node.alternate, this.context);
        this.value = {
            type: Keywords.ConditionalExpression,
            condition: this.conditionHandler?.value,
            consequent: this.consequentHandler?.value,
            alternate: this.alternateHandler?.value
        };
    }
}

Handler.registerHandler(Keywords.Conditional, ConditionalHandler);
