import type { Expression } from ".";
import { MemberAccess } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import { Exp } from "./expression";

export type MemberAccessType = {
    type: "MemberExpression",
    property: string | Expression,
    computed: boolean,
}

export class MemberAccessHandler extends Handler{
    public value: MemberAccessType;
    private propertyHandler: Handler | null = null;

    handle(node: Exp<MemberAccess, "MemberExpression">) {

        const computed = node.computed;
        if(computed){
            this.propertyHandler = Handler.handle(node.property, this.context);
        }else{
            this.propertyHandler = null;
        }

        this.value = {
            type: "MemberExpression",
            property: this.propertyHandler?.value || node.property as string,
            computed,
        };
    }
}

Handler.registerHandler("MemberExpression", MemberAccessHandler);