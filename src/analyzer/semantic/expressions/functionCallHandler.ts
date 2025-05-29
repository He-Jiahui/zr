import type {ExpressionType} from ".";
import {Handler} from "../common/handler";

export type FunctionCallType = {
    type: "FunctionCall",
    args: ExpressionType[];
};

export class FunctionCallHandler extends Handler {
    public value: FunctionCallType;
    public readonly argsHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.argsHandler
        ];
    }

    _handle(node: FunctionCallType) {
        super._handle(node);
        this.argsHandler.length = 0;
        if (node.args) {
            for (const arg of node.args) {
                const handler = Handler.handle(arg, this.context);
                this.argsHandler.push(handler);
            }
        }
        this.value = {
            type: "FunctionCall",
            args: this.argsHandler.map(handler => handler?.value),
        };
    }
}

Handler.registerHandler("FunctionCall", FunctionCallHandler);
