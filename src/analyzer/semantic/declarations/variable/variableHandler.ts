import { VariableDeclaration } from "../../../../parser/generated/parser";
import { Symbol } from "../../../static/symbol/symbol";
import { VariableSymbol } from "../../../static/symbol/variableSymbol";
import { Handler } from "../../common/handler";
import type { ExpressionType } from "../../expressions";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler"
import type { DestructuringArrayType, DestructuringObjectType } from "./destructuringHandler";

export type VariableType = {
    type: "VariableDeclaration",
    pattern: IdentifierType | DestructuringArrayType | DestructuringObjectType;
    value: ExpressionType;
    typeInfo: AllType;
}

export class VariableHandler extends Handler{
    public value: VariableType;

    private patternHandler: Handler| null = null;
    private valueHandler: Handler| null = null;
    private typeHandler: Handler| null = null;

    public _handle(node: VariableDeclaration): void {
        this.patternHandler = Handler.handle(node.pattern, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        if(node.typeInfo){
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        }else{
            this.typeHandler = null;
        }

        this.value = {
            type: "VariableDeclaration",
            pattern: this.patternHandler?.value,
            value: this.valueHandler?.value,
            typeInfo: this.typeHandler?.value
        }
    }

    protected _collectDeclarations(): Symbol | undefined {
    
        const getDeclaration = (Identifier: IdentifierType): Symbol|undefined=>{
            const handler = Handler.getHandler(Identifier);
            const symbol = this.context.declare<VariableSymbol>(Identifier.name, "Variable", handler?.location);        
            return symbol;
        }
        const collect = ()=>{
            switch(this.value.pattern.type){
                case "Identifier":
                    return getDeclaration(this.value.pattern);
                case "DestructuringArray":{
                    return this.value.pattern.keys.map(key=>{
                        return getDeclaration(key);
                    });
                }
                case "DestructuringObject":{
                    return this.value.pattern.keys.map(key=>{
                        return getDeclaration(key);
                    });
                }
            }
        }
        const declaration = collect();
        
        this.valueHandler?.collectDeclarations();

        if(declaration instanceof Array){
            const symbol = this.context.declare<VariableSymbol>("", "Variable");
            for(const d of declaration){
                if(!d){
                    continue;
                }
                symbol.subSymbols.push(d);
            }
            return symbol;
        }
        return declaration;
        
    }
}

Handler.registerHandler("VariableDeclaration", VariableHandler);
