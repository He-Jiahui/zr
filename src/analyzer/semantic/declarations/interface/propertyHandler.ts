import {InterfacePropertySignature} from "../../../../parser/generated/parser";
import {Access, PropertyType} from "../../../../types/access";
import {Handler} from "../../common/handler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type InterfacePropertySignatureType = {
    type: "InterfacePropertySignature",
    name: IdentifierType,
    typeInfo: AllType,
    access: Access,
    propertyType: PropertyType,

}

export class InterfacePropertySignatureHandler extends Handler {
    public value: InterfacePropertySignatureType;
    private typeInfoHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler
        ];
    }

    public _handle(node: InterfacePropertySignature) {
        super._handle(node);
        const name = node.name;
        const nameHandler = Handler.handle(name, this.context);
        const access = node.access;
        const propertyType = node.propertyType;
        if (node.typeInfo) {
            this.typeInfoHandler = Handler.handle(node.typeInfo, this.context);
        } else {
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
