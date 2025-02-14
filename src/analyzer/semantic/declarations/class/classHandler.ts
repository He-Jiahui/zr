import { Handler } from "../../common/handler";
import { ClassDeclaration } from "../../../../parser/generated/parser";
import type { ClassFieldType } from "./fieldHandler";
import type { ClassPropertyType } from "./propertyHandler";
import type { ClassMethodType } from "./methodHandler";
import type { ClassMetaFunctionType } from "./metaFunctionHandler";
import type { IdentifierType } from "../identifierHandler";
import type { DecoratorExpressionType } from "../../expressions/decoratorHandler";
import type { GenericDeclarationType } from "../../types/genericDeclarationHandler";

export type ClassType ={
    type: "Class";
    name: IdentifierType;
    inherits?: IdentifierType[];
    decorators?: DecoratorExpressionType[];
    generic: GenericDeclarationType[];
    fields: ClassFieldType[];
    properties: ClassPropertyType[];
    methods: ClassMethodType[];
    metaFunctions: ClassMetaFunctionType[];
}

export class ClassDeclarationHandler extends Handler{
    public value: ClassType;
    private nameHandler: Handler | null = null;

    public readonly membersHandler: Handler[] = [];

    public readonly inheritsHandler: Handler[] = [];

    public readonly decoratorsHandler: Handler[] = [];

    public genericHandler: Handler | null = null;
    
    public handle(node: ClassDeclaration) {
        super.handle(node);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        this.decoratorsHandler.length = 0;
        this.nameHandler = Handler.handle(node.name, this.context);
        if(node.inherits){
            for(const inherit of node.inherits){
                const handler = Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if(node.decorator){
            for(const decorator of node.decorator){
                const handler = Handler.handle(decorator, this.context);
                this.decoratorsHandler.push(handler);
            }
        }
        if(node.generic){
            this.genericHandler = Handler.handle(node.generic, this.context);
        }else{
            this.genericHandler = null;
        }

        const fields:ClassFieldType[] = [];
        const methods:ClassMethodType[] = [];
        const metaFunctions:ClassMetaFunctionType[] = [];
        const properties: ClassPropertyType[] = [];
        for(const member of members){
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (ClassFieldType|ClassMethodType|ClassMetaFunctionType|ClassPropertyType);
            if(!value){
                continue;
            }
            switch(value.type){
                case "ClassField":{
                    fields.push(value);
                }break;
                case "ClassMethod":{
                    methods.push(value);
                }break;
                case "ClassMetaFunction":{
                    metaFunctions.push(value);
                }break;
                case "ClassProperty":{
                    properties.push(value);
                }break;
            }
        }
        this.value = {
            type: "Class",
            name: this.nameHandler?.value,
            inherits: this.inheritsHandler.map(handler=>handler?.value),
            decorators: this.decoratorsHandler.map(handler=>handler?.value),
            generic: this.genericHandler?.value,
            fields,
            methods,
            metaFunctions,
            properties,
        };
    }
}

Handler.registerHandler("ClassDeclaration", ClassDeclarationHandler);