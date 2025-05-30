import {ExpressionType} from "./index";
import {Handler} from "../common/handler";
import {TNullable} from "../../utils/zrCompilerTypes";

export type UnpackLiteralType = {
    type: "UnpackLiteralExpression",
    element: ExpressionType
}

export class UnpackLiteralHandler extends Handler {
    public value: UnpackLiteralType;
    private elementHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.elementHandler
        ];
    }

    public _handle(node: any): void {
        super._handle(node);
        this.elementHandler = Handler.handle(node.element, this.context);
        this.value = {
            type: "UnpackLiteralExpression",
            element: this.elementHandler?.value
        }
    }
}

Handler.registerHandler("UnpackLiteral", UnpackLiteralHandler);
