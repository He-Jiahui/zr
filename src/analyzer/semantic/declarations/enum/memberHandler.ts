import { EnumMember } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";

export type EnumMemberType = {
    type: "EnumMember",
    name: string,
    value: any
}

export class EnumMemberHandler extends Handler{
    public value: EnumMemberType;
    private valueHandler: Handler | null = null;

    public handle(node: EnumMember) {
        super.handle(node);
        const name = node.name;
        if(node.value){
            this.valueHandler = Handler.handle(node.value, this.context);
        }else{
            this.valueHandler = null;
        }
        this.value = {
            type: "EnumMember",
            name,
            value: this.valueHandler?.value,
        };
    }
}

Handler.registerHandler("EnumMember", EnumMemberHandler);