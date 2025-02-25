import { InterfaceFieldDeclaration, InterfaceDeclaration, InterfaceMethodSignature, InterfacePropertySignature } from "../../../../parser/generated/parser";
import { InterfaceScope } from "../../../static/scope/interfaceScope";
import { ModuleScope } from "../../../static/scope/moduleScope";
import { InterfaceSymbol } from "../../../static/symbol/interfaceSymbol";
import { Symbol } from "../../../static/symbol/symbol";
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
    generic: GenericDeclarationType,
}

export class InterfaceDeclarationHandler extends Handler{
    public value: InterfaceType;
    private nameHandler: Handler | null = null;
    public readonly membersHandler: Handler[] = [];
    public readonly inheritsHandler: Handler[] = [];
    public genericHandler: Handler | null = null;
    
    public _handle(node: InterfaceDeclaration) {
        super._handle(node);
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

    protected _collectDeclarations(): Symbol | undefined {
        const interfaceName = this.value.name.name;
        const symbol = this.context.declare<InterfaceSymbol>(interfaceName, "Interface");
        const scope = this.pushScope<InterfaceScope>("Interface");
        scope.interfaceInfo = symbol;
        symbol.table = scope;
        if(this.value.generic){
            for(const generic of this.value.generic.typeArguments){
                const handler = Handler.getHandler(generic);
                scope.addGeneric(handler?.collectDeclarations());
            }
        }

        for(const field of this.value.fields){
            const handler = Handler.getHandler(field);
            scope.addField(handler?.collectDeclarations());
        }
        for(const method of this.value.methods){
            const handler = Handler.getHandler(method);
            scope.addMethod(handler?.collectDeclarations());
        }
        for(const property of this.value.properties){
            const handler = Handler.getHandler(property);
            scope.addProperty(handler?.collectDeclarations());
        }

        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("InterfaceDeclaration", InterfaceDeclarationHandler);