import {AssignmentExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import type {ConditionalType} from "./conditionalHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";

export type AssignmentType = {
    type: Keywords.AssignmentExpression,
    left: ConditionalType,
    right: AssignmentType | ConditionalType,
    op: string
} | ConditionalType;

export class AssignmentHandler extends Handler {
    public value: AssignmentType;
    private leftHandler: TNullable<Handler> = null;
    private rightHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.leftHandler,
            this.rightHandler
        ];
    }

    public _handle(node: TExpression<AssignmentExpression, "Assignment">) {
        super._handle(node);
        this.leftHandler = Handler.handle(node.left, this.context);
        this.rightHandler = Handler.handle(node.right, this.context);
        this.value = {
            type: Keywords.AssignmentExpression,
            left: this.leftHandler?.value,
            right: this.rightHandler?.value,
            op: node.op
        };
    }

}

Handler.registerHandler(Keywords.Assignment, AssignmentHandler);
