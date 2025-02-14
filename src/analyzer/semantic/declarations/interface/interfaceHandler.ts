import { InterfaceFieldDeclaration, InterfaceDeclaration, InterfaceMethodSignature, InterfacePropertySignature } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { GenericDeclarationType } from "../../types/genericDeclarationHandler";
import type { IdentifierType } from "../identifierHandler";
import type { InterfaceFieldDeclarationType } from "./fieldHandler";
import type { InterfaceMethodSignatureType } from "./methodHandler";
import type { InterfacePropertySignatureType } from "./propertyHandler";

export type InterfaceType = {
    type: "Interface",
    name: IdentifierType,
    methods: InterfaceMethodSignatureType[],
    properties: InterfacePropertySignatureType[],
    fields: InterfaceFieldDeclarationType[],
    inherits: IdentifierType[],
    generic: GenericDeclarationType[],
}

export class InterfaceDeclarationHandler extends Handler{
    public value: InterfaceType;
    private nameHandler: Handler | null = null;
    public readonly membersHandler: Handler[] = [];
    public readonly inheritsHandler: Handler[] = [];
    public genericHandler: Handler | null = null;
    
    public handle(node: InterfaceDeclaration) {
        super.handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        if(node.inherits){
            for(const inherit of node.inherits){
                const handler = Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if(node.generic){
            this.genericHandler = Handler.handle(node.generic, this.context);
        }else{
            this.genericHandler = null;
        }

        const fields:any[] = [];
        const methods:any[] = [];
        const properties:any[] = [];
        for(const member of members){
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (InterfaceMethodSignature|InterfacePropertySignature|InterfaceFieldDeclaration);
            if(!value){
                continue;
            }
            switch(value.type){
                case "InterfaceFieldDeclaration":{
                    fields.push(value);
                }break;
                case "InterfaceMethodSignature":{
                    methods.push(value);
                }break;
                case "InterfacePropertySignature":{
                    properties.push(value);
                }break;
            }
        }
        this.value = {
            type: "Interface",
            name: this.nameHandler?.value,
            fields,
            methods,
            properties,
            inherits: this.inheritsHandler.map(handler => handler?.value),
            generic: this.genericHandler?.value
        };
    }
}

Handler.registerHandler("InterfaceDeclaration", InterfaceDeclarationHandler);