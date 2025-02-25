import { InterfacePropertySignature } from "../../../../parser/generated/parser";
import { Access, PropertyType } from "../../../../types/access";
import { Handler } from "../../common/handler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";

export type InterfacePropertySignatureType = {
    type: "InterfacePropertySignature",
    name: IdentifierType,
    typeInfo: AllType,
    access: Access,
    propertyType: PropertyType,

}

export class InterfacePropertySignatureHandler extends Handler{
    public value: InterfacePropertySignatureType;
    private typeInfoHandler: Handler | null = null;
    private nameHandler: Handler | null = null;
    public _handle(node: InterfacePropertySignature) {
        super._handle(node);
        const name = node.name;
        const nameHandler = Handler.handle(name, this.context);
        const access = node.access;
        const propertyType = node.propertyType;
        if(node.typeInfo){
            this.typeInfoHandler = Handler.handle(node.typeInfo, this.context);
        }else{
            this.typeInfoHandler = null;
        }
        this.value = {
            type: "InterfacePropertySignature",
            name: nameHandler?.value,
            access: access as Access,
            typeInfo: this.typeInfoHandler?.value,
            propertyType: propertyType as PropertyType,
        };
    }
}

Handler.registerHandler("InterfacePropertySignature", InterfacePropertySignatureHandler);