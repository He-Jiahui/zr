import {UnaryExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {FunctionCallType} from "./functionCallHandler";
import type {LiteralExpressionType} from "./literalHandler";
import type {MemberAccessType} from "./memberAccessHandler";
import {TExpression, TNullable} from "../../utils/zrCompilerTypes";
import {Keywords} from "../../../types/keywords";


export type PrimaryType = {
    type: Keywords.PrimaryExpression;
    property: LiteralExpressionType;
    members: (MemberAccessType | FunctionCallType)[];
}

export class PrimaryHandler extends Handler {
    public value: PrimaryType;
    private propertyHandler: TNullable<Handler> = null;
    private readonly memberHandlers: Handler[] = [];

    protected get _children() {
        return [
            this.propertyHandler,
            ...this.memberHandlers
        ];
    }

    public _handle(node: TExpression<UnaryExpression, "PrimaryExpression">) {
        super._handle(node);
        this.memberHandlers.length = 0;
        this.propertyHandler = Handler.handle(node.property, this.context);
        if (node.members) {
            for (const member of node.members) {
                const handler = Handler.handle(member, this.context);
                this.memberHandlers.push(handler);
            }
        }

        this.value = {
            type: Keywords.PrimaryExpression,
            property: this.propertyHandler?.value,
            members: this.memberHandlers.map(handler => handler?.value)
        };
    }
}

Handler.registerHandler(Keywords.PrimaryExpression, PrimaryHandler);
