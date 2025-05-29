import {TNullable} from "../../utils/zrCompilerTypes";
import {Handler} from "../common/handler";
import type {PrimaryType} from "./primaryHandler";
import type {UnaryType} from "./unaryHandler";

export type BinaryType = {
    type: "BinaryExpression",
    left: UnaryType,
    right: BinaryType,
    op: string
} | UnaryType | PrimaryType;

export class BinaryHandler extends Handler {
    public value: BinaryType;
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
            type: "BinaryExpression",
            left: this.leftHandler?.value,
            right: this.rightHandler?.value,
            op: node.op
        };
    }
}

Handler.registerHandler("Binary", BinaryHandler);
