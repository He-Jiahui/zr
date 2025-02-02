import { InterfaceFieldDeclaration } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import { Handler } from "../../common/handler";

export type InterfaceFieldDeclarationType = {
    type: "InterfaceFieldDeclaration",
    name: string,
    targetType: any,
    access: Access,
}

export class InterfaceFieldDeclarationHandler extends Handler{
    public value: InterfaceFieldDeclarationType;
    private targetTypeHandler: Handler | null = null;

    public handle(node: InterfaceFieldDeclaration) {
        super.handle(node);
        const name = node.name;
        const access = node.access;
        if(node.targetType){
            this.targetTypeHandler = Handler.handle(node.targetType, this.context);
        }else{
            this.targetTypeHandler = null;
        }
        this.value = {
            type: "InterfaceFieldDeclaration",
            name,
            access: access as Access,
            targetType: this.targetTypeHandler?.value,
        };
    }
}

Handler.registerHandler("InterfaceFieldDeclaration", InterfaceFieldDeclarationHandler);