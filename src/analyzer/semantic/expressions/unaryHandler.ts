import { UnaryExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import { Exp } from "./expression";

export type UnaryType = {
    type: "UnaryExpression",
    operator: string,
    arguments: UnaryType
};


export class UnaryHandler extends Handler{
    public value: UnaryType;
    private operatorHandler: Handler | null = null;
    private argumentHandler: Handler | null = null;

    handle(node: Exp<UnaryExpression, "Unary">) {
        this.operatorHandler = Handler.handle(node.op, this.context);
        this.argumentHandler = Handler.handle(node.argument, this.context);
        this.value = {
            type: "UnaryExpression",
            operator: this.operatorHandler.value,
            arguments: this.argumentHandler.value
        };
    }
}

Handler.registerHandler("Unary", UnaryHandler);
