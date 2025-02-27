import { InterfaceFieldDeclaration } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import { Handler } from "../../common/handler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";

export type InterfaceFieldDeclarationType = {
    type: "InterfaceFieldDeclaration",
    name: IdentifierType,
    targetType: AllType,
    access: Access,
}

export class InterfaceFieldDeclarationHandler extends Handler{
    public value: InterfaceFieldDeclarationType;
    private nameHandler: Handler | null = null;
    private targetTypeHandler: Handler | null = null;

    public _handle(node: InterfaceFieldDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const access = node.access;
        if(node.targetType){
            this.targetTypeHandler = Handler.handle(node.targetType, this.context);
        }else{
            this.targetTypeHandler = null;
        }
        this.value = {
            type: "InterfaceFieldDeclaration",
            name: this.nameHandler?.value,
            access: access as Access,
            targetType: this.targetTypeHandler?.value,
        };
    }
}

Handler.registerHandler("InterfaceFieldDeclaration", InterfaceFieldDeclarationHandler);