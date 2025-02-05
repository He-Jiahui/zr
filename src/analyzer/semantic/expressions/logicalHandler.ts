import { Handler } from "../common/handler";
import type { BinaryType } from "./binaryHandler";
export type LogicalType = {
    type: "LogicalExpression",
    left: LogicalType | BinaryType,
    right: LogicalType,
    op: string
} | BinaryType;

export class LogicalHandler extends Handler{
    private leftHandler: Handler | null = null;
    private rightHandler: Handler | null = null;
    public value: LogicalType;
    public handle(node: {
        left: any,
        right: any,
        op: string
    }) {
        super.handle(node);
        this.leftHandler = Handler.handle(node.left, this.context);
        this.rightHandler = Handler.handle(node.right, this.context);
        this.value = {
            type: "LogicalExpression",
            left: this.leftHandler.value,
            right: this.rightHandler.value,
            op: node.op
        };
    }
}

Handler.registerHandler("Logical", LogicalHandler);