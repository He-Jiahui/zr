import type { Expression } from ".";
import { ConditionalExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import { Exp } from "./expression";
import type { LogicalType } from "./logicalHandler";

export type ConditionalType = {
    type: "ConditionalExpression",
    condition: LogicalType,
    consequent: Expression,
    alternate: ConditionalType
} | LogicalType;

export class ConditionalHandler extends Handler{
    private conditionHandler: Handler | null = null;
    private consequentHandler: Handler | null = null;
    private alternateHandler: Handler | null = null;
    public value: ConditionalType;
    public handle(node: Exp<ConditionalExpression, "Conditional">) {
        super.handle(node);
        this.conditionHandler = Handler.handle(node.test, this.context);
        this.consequentHandler = Handler.handle(node.consequent, this.context);
        this.alternateHandler = Handler.handle(node.alternate, this.context);
        this.value = {
            type: "ConditionalExpression",
            condition: this.conditionHandler.value,
            consequent: this.consequentHandler.value,
            alternate: this.alternateHandler.value
        };
    }
}

Handler.registerHandler("Conditional", ConditionalHandler);