import {Handler} from "../common/handler";
import type {BinaryType} from "./binaryHandler";
import {TNullable} from "../../utils/zrCompilerTypes";

export type LogicalType = {
    type: "LogicalExpression",
    left: LogicalType | BinaryType,
    right: LogicalType,
    op: string
} | BinaryType;

export class LogicalHandler extends Handler {
    public value: LogicalType;
    private leftHandler: TNullable<Handler> = null;
    private rightHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.leftHandler,
            this.rightHandler
        ];
    }

    public _handle(node: {
        left: any,
        right: any,
        op: string
    }) {
        super._handle(node);
        this.leftHandler = Handler.handle(node.left, this.context);
        this.rightHandler = Handler.handle(node.right, this.context);
        this.value = {
            type: "LogicalExpression",
            left: this.leftHandler?.value,
            right: this.rightHandler?.value,
            op: node.op
        };
    }
}

Handler.registerHandler("Logical", LogicalHandler);
