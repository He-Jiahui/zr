import { EnumDeclaration } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import { EnumMemberType } from "./memberHandler";

export type EnumType = {
    type: "Enum",
    name: string,
    members: EnumMemberType[],
    baseType: any
}

export class EnumDeclarationHandler extends Handler{
    public value: EnumType;
    private baseTypeHandler: Handler | null = null;
    private membersHandler: Handler[] = [];

    public handle(node: EnumDeclaration) {
        super.handle(node);
        const name = node.name;
        const members = node.members;
        const baseType = node.baseType;
        if(baseType){
            this.baseTypeHandler = Handler.handle(baseType, this.context);
        }else{
            this.baseTypeHandler = null;
        }
        this.membersHandler.length = 0;
        for(const member of members){
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
        }
        this.value = {
            type: "Enum",
            name,
            members: this.membersHandler.map(handler=>handler.value),
            baseType: this.baseTypeHandler?.value
        };
    }
}

Handler.registerHandler("EnumDeclaration", EnumDeclarationHandler);