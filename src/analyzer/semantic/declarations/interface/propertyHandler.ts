import { InterfacePropertySignature } from "../../../../parser/generated/parser";
import { Access, PropertyType } from "../../../../types/access";
import { Handler } from "../../common/handler";

export type InterfacePropertySignatureType = {
    type: "InterfacePropertySignature",
    name: string,
    typeInfo: any,
    access: Access,
    propertyType: PropertyType,

}

export class InterfacePropertySignatureHandler extends Handler{
    public value: InterfacePropertySignatureType;
    private typeInfoHandler: Handler | null = null;

    public handle(node: InterfacePropertySignature) {
        super.handle(node);
        const name = node.name;
        const access = node.access;
        const propertyType = node.propertyType;
        if(node.typeInfo){
            this.typeInfoHandler = Handler.handle(node.typeInfo, this.context);
        }else{
            this.typeInfoHandler = null;
        }
        this.value = {
            type: "InterfacePropertySignature",
            name,
            access: access as Access,
            typeInfo: this.typeInfoHandler?.value,
            propertyType: propertyType as PropertyType,
        };
    }
}

Handler.registerHandler("InterfacePropertySignature", InterfacePropertySignatureHandler);