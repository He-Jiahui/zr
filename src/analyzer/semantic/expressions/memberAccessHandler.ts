import type { ExpressionType } from ".";
import { MemberAccess } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import type { IdentifierType } from "../declarations/identifierHandler";
import { Exp } from "./expression";

export type MemberAccessType = {
    type: "MemberExpression",
    property: IdentifierType | ExpressionType,
    computed: boolean,
}

export class MemberAccessHandler extends Handler{
    public value: MemberAccessType;
    private propertyHandler: Handler | null = null;

    handle(node: Exp<MemberAccess, "MemberExpression">) {
        super.handle(node);
        const computed = node.computed;
        if(computed){
            this.propertyHandler = Handler.handle(node.property, this.context);
        }else{
            this.propertyHandler = null;
        }

        this.value = {
            type: "MemberExpression",
            property: this.propertyHandler?.value,
            computed,
        };
    }
}

Handler.registerHandler("MemberExpression", MemberAccessHandler);