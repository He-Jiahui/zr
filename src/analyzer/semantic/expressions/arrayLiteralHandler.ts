import type { ExpressionType } from "."
import { ArrayLiteral } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"

export type ArrayLiteralType = {
    type: "ArrayLiteralExpression",
    elements: ExpressionType[]
}

export class ArrayLiteralHandler extends Handler{
    public value: ArrayLiteralType;
    private readonly elementsHandler: Handler[] = [];

    public handle(node: ArrayLiteral): void {
        super.handle(node);
        this.elementsHandler.length = 0;
        for(const element of node.elements){
            const handler = Handler.handle(element, this.context);
            this.elementsHandler.push(handler);
        }
        this.value = {
            type: "ArrayLiteralExpression",
            elements: this.elementsHandler.map(handler => handler?.value)
        }
    }
}

Handler.registerHandler("ArrayLiteral", ArrayLiteralHandler);