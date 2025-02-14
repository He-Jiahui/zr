import { Handler } from "../../common/handler";
import { StructDeclaration } from "../../../../parser/generated/parser";
import { StructMethodType } from "./methodHandler";
import { StructFieldType } from "./fieldHandler";
import { StructMetaFunctionType } from "./metaFunctionHandler";
import type { IdentifierType } from "../identifierHandler";

export type StructType ={
    type: "Struct";
    name: IdentifierType;
    fields: StructFieldType[];
    methods: StructMethodType[];
    metaFunctions: StructMetaFunctionType[];
}

export class StructDeclarationHandler extends Handler{
    public value: StructType;
    private nameHandler: Handler|null = null;
    public readonly membersHandler: Handler[] = [];
    
    public handle(node: StructDeclaration) {
        super.handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        const fields:StructFieldType[] = [];
        const methods:StructMethodType[] = [];
        const metaFunctions:StructMetaFunctionType[] = [];
        for(const member of members){
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (StructFieldType|StructMethodType|StructMetaFunctionType);
            if(!value){
                continue;
            }
            switch(value.type){
                case "StructField":{
                    fields.push(value);
                }break;
                case "StructMethod":{
                    methods.push(value);
                }break;
                case "StructMetaFunction":{
                    metaFunctions.push(value);
                }break;
            }
        }
        this.value = {
            type: "Struct",
            name: this.nameHandler?.value,
            fields,
            methods,
            metaFunctions
        };
    }
}

Handler.registerHandler("StructDeclaration", StructDeclarationHandler);