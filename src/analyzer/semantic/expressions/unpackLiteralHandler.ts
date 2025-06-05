import {ExpressionType} from "./index";
import {Handler} from "../common/handler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type UnpackLiteralType = {
    type: Keywords.UnpackLiteralExpression,
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
            type: Keywords.UnpackLiteralExpression,
            element: this.elementHandler?.value
        }
    }
}

Handler.registerHandler(Keywords.UnpackLiteral, UnpackLiteralHandler);
