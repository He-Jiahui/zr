import {UnaryExpression, UnaryOperator} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {PrimaryType} from "./primaryHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";

export type UnaryOperatorType = {
    type: "UnaryOperator",
    operator: "!" | "~" | "+" | "-" | "$" | "new" | string
}

export class UnaryOperatorHandler extends Handler {
    public value: UnaryOperatorType;

    _handle(node: UnaryOperator) {
        super._handle(node);
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


export class UnaryHandler extends Handler {
    public value: UnaryType;
    private operatorHandler: TNullable<Handler> = null;
    private argumentHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.operatorHandler,
            this.argumentHandler
        ];
    }

    _handle(node: TExpression<UnaryExpression, "Unary">) {
        super._handle(node);
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
