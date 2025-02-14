import { InterfaceMethodSignature } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import { Handler } from "../../common/handler";
import type { GenericDeclarationType } from "../../types/genericDeclarationHandler";
import type { ParameterType } from "../../types/parameterHandler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";

export type InterfaceMethodSignatureType = {
    type: "InterfaceMethodSignature",
    name: IdentifierType,
    returnType: AllType,
    parameters: ParameterType[],
    generic: GenericDeclarationType,
    access: Access,
}

export class InterfaceMethodSignatureHandler extends Handler{
    public value: InterfaceMethodSignatureType;
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private genericHandler: Handler | null = null;
    private nameHandler: Handler | null = null;

    public handle(node: InterfaceMethodSignature) {
        super.handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const access = node.access;
        if(node.generic){
            this.genericHandler = Handler.handle(node.generic, this.context);
        }else{
            this.genericHandler = null;
        }
        if(node.returnType){
            this.returnTypeHandler = Handler.handle(node.returnType, this.context);
        }else{
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        this.parameterHandlers.length = 0;
        for(const parameter of parameters){
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        this.value = {
            type: "InterfaceMethodSignature",
            name: this.nameHandler?.value,
            access: access as Access,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            generic: this.genericHandler?.value,
        };
    }
}

Handler.registerHandler("InterfaceMethodSignature", InterfaceMethodSignatureHandler);