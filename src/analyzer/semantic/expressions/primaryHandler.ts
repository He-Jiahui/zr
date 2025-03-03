import { UnaryExpression } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import { Exp } from "./expression";
import type { FunctionCallType } from "./functionCallHandler";
import type { LiteralExpressionType } from "./literalHandler";
import type { MemberAccessType } from "./memberAccessHandler";

export type PrimaryType = {
    type: "PrimaryExpression";
    property: LiteralExpressionType;
    members: (MemberAccessType | FunctionCallType)[];
}

export class PrimaryHandler extends Handler{
    public value: PrimaryType;
    private propertyHandler: Handler | null = null;
    private readonly memberHandlers: Handler[] = [];

    public _handle(node: Exp<UnaryExpression, "PrimaryExpression">) {
        super._handle(node);
        this.memberHandlers.length = 0;
        this.propertyHandler = Handler.handle(node.property, this.context);
        if(node.members){
            for(const member of node.members){
                const handler = Handler.handle(member, this.context);
                this.memberHandlers.push(handler);
            }
        }

        this.value = {
            type: "PrimaryExpression",
            property: this.propertyHandler?.value,
            members: this.memberHandlers.map(handler=>handler?.value),
        }
    }
}

Handler.registerHandler("PrimaryExpression", PrimaryHandler);