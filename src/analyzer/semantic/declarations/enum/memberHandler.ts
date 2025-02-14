import { EnumMember } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { ExpressionType } from "../../expressions";
import type { IdentifierType } from "../identifierHandler";

export type EnumMemberType = {
    type: "EnumMember",
    name: IdentifierType,
    value: ExpressionType
}

export class EnumMemberHandler extends Handler{
    public value: EnumMemberType;
    private nameHandler: Handler | null = null;
    private valueHandler: Handler | null = null;

    public handle(node: EnumMember) {
        super.handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        if(node.value){
            this.valueHandler = Handler.handle(node.value, this.context);
        }else{
            this.valueHandler = null;
        }
        this.value = {
            type: "EnumMember",
            name: this.nameHandler?.value,
            value: this.valueHandler?.value,
        };
    }
}

Handler.registerHandler("EnumMember", EnumMemberHandler);