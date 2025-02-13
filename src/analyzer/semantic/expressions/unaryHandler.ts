import { UnaryExpression, UnaryOperator } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import { Exp } from "./expression";
import type { PrimaryType } from "./primaryHandler";

export type UnaryOperatorType = {
    type : "UnaryOperator",
    operator: "!"|"~"|"+"|"-"|"$"|"new"| string
}

export class UnaryOperatorHandler extends Handler{
    public value: UnaryOperatorType;
    handle(node: UnaryOperator) {
        super.handle(node);
        this.value = {
            type: "UnaryOperator",
            operator: node.operator
        };
    }
}

Handler.registerHandler("UnaryOperator", UnaryOperatorHandler);

export type UnaryType = {
    type: "UnaryExpression",
    operator: string,
    arguments: UnaryType
} | PrimaryType;


export class UnaryHandler extends Handler{
    public value: UnaryType;
    private operatorHandler: Handler | null = null;
    private argumentHandler: Handler | null = null;

    handle(node: Exp<UnaryExpression, "Unary">) {
        super.handle(node);
        this.operatorHandler = Handler.handle(node.op, this.context);
        this.argumentHandler = Handler.handle(node.argument, this.context);
        this.value = {
            type: "UnaryExpression",
            operator: this.operatorHandler?.value,
            arguments: this.argumentHandler?.value
        };
    }
}

Handler.registerHandler("Unary", UnaryHandler);
