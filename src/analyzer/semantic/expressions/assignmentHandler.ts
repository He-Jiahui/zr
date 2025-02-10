import { AssignmentExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"
import type { ConditionalType } from "./conditionalHandler";
import { Exp } from "./expression";

export type AssignmentType = {
    type: "AssignmentExpression",
    left: ConditionalType,
    right: AssignmentType | ConditionalType,
    op: string
} | ConditionalType;

export class AssignmentHandler extends Handler{
    private leftHandler: Handler | null = null;
    private rightHandler: Handler | null = null;
    public value: AssignmentType;
    public handle(node: Exp<AssignmentExpression, "Assignment">) {
        super.handle(node);
        this.leftHandler = Handler.handle(node.left, this.context);
        this.rightHandler = Handler.handle(node.right, this.context);
        this.value = {
            type: "AssignmentExpression",
            left: this.leftHandler?.value,
            right: this.rightHandler?.value,
            op: node.op
        };
    }
}

Handler.registerHandler("Assignment", AssignmentHandler);