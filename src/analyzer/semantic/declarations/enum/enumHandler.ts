import { EnumDeclaration } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";
import type { EnumMemberType } from "./memberHandler";

export type EnumType = {
    type: "Enum",
    name: IdentifierType,
    members: EnumMemberType[],
    baseType: AllType
}

export class EnumDeclarationHandler extends Handler{
    public value: EnumType;
    private baseTypeHandler: Handler | null = null;
    private membersHandler: Handler[] = [];
    private nameHandler: Handler | null = null;

    public handle(node: EnumDeclaration) {
        super.handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
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
            name: this.nameHandler?.value,
            members: this.membersHandler.map(handler=>handler?.value),
            baseType: this.baseTypeHandler?.value
        };
    }
}

Handler.registerHandler("EnumDeclaration", EnumDeclarationHandler);