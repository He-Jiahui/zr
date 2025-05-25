import {AssignmentExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import type {ConditionalType} from "./conditionalHandler";
import {Exp} from "./expression";
import {makeSymbolSet, Symbol, SymbolOrSymbolSet} from "../../static/symbol/symbol";

export type AssignmentType = {
    type: "AssignmentExpression",
    left: ConditionalType,
    right: AssignmentType | ConditionalType,
    op: string
} | ConditionalType;

export class AssignmentHandler extends Handler {
    private leftHandler: Handler | null = null;
    private rightHandler: Handler | null = null;
    public value: AssignmentType;

    public _handle(node: Exp<AssignmentExpression, "Assignment">) {
        super._handle(node);
        this.leftHandler = Handler.handle(node.left, this.context);
        this.rightHandler = Handler.handle(node.right, this.context);
        this.value = {
            type: "AssignmentExpression",
            left: this.leftHandler?.value,
            right: this.rightHandler?.value,
            op: node.op
        };
    }

    protected _collectDeclarations(): SymbolOrSymbolSet {
        switch (this.value.type) {
            case "AssignmentExpression": {
                const leftHandler = Handler.getHandler(this.value.left);
                const rightHandler = Handler.getHandler(this.value.right);
                return makeSymbolSet(leftHandler, rightHandler);
            }
                break;
            case "ConditionalExpression": {
                const conditionHandler = Handler.getHandler(this.value.condition);
                const alternateHandler = Handler.getHandler(this.value.alternate);
                const consequentHandler = Handler.getHandler(this.value.consequent);
                return makeSymbolSet(conditionHandler, consequentHandler, alternateHandler);
            }
                break;
            case "BinaryExpression": {
                const leftHandler = Handler.getHandler(this.value.left);
                const rightHandler = Handler.getHandler(this.value.right);
                return makeSymbolSet(leftHandler, rightHandler);
            }
                break;
            case "LogicalExpression": {
                const leftHandler = Handler.getHandler(this.value.left);
                const rightHandler = Handler.getHandler(this.value.right);
                return makeSymbolSet(leftHandler, rightHandler);
            }
                break;
            case "PrimaryExpression": {
                const propertyHandler = Handler.getHandler(this.value.property);
                const membersHandler = this.value.members.map(m => Handler.getHandler(m));
                return makeSymbolSet(propertyHandler, ...membersHandler);
            }
                break;
            case "UnaryExpression": {
                const handler = Handler.getHandler(this.value.arguments);
                return handler?.collectDeclarations();
            }
                break;
            default: {
                return undefined;
            }
        }
    }

}

Handler.registerHandler("Assignment", AssignmentHandler);
