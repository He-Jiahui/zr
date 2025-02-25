import { Handler } from "../../common/handler";
import { StructDeclaration } from "../../../../parser/generated/parser";
import { StructMethodType } from "./methodHandler";
import { StructFieldType } from "./fieldHandler";
import { StructMetaFunctionType } from "./metaFunctionHandler";
import type { IdentifierType } from "../identifierHandler";
import { StructSymbol } from "../../../static/symbol/structSymbol";
import { ModuleScope } from "../../../static/scope/moduleScope";
import { StructScope } from "../../../static/scope/structScope";

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

    private _symbol: StructSymbol|null = null;
    
    public _handle(node: StructDeclaration) {
        super._handle(node);
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

    protected _collectDeclarations() {
        const structName: string = this.value.name.name;
        const symbol = this.context.declare<StructSymbol>(structName, "Struct");
        const scope = this.pushScope<StructScope>("Struct");
        scope.structInfo = symbol;
        symbol.table = scope;
        
        for(const field of this.value.fields){
            const handler = Handler.getHandler(field);
            scope.addField(handler?.collectDeclarations());
        }
        for(const method of this.value.methods){
            const handler = Handler.getHandler(method);
            scope.addMethod(handler?.collectDeclarations());
        }
        for(const metaFunction of this.value.metaFunctions){
            const handler = Handler.getHandler(metaFunction);
            scope.addMetaFunction(handler?.collectDeclarations());
        }
        

        this.popScope();
        this._symbol = symbol;
        return symbol;
    }
}

Handler.registerHandler("StructDeclaration", StructDeclarationHandler);