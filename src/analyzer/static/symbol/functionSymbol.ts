
import { Access } from "../../../types/access";
import type { FunctionScope } from "../scope/functionScope";
import type { TypeReference } from "../type/type";
import { Symbol } from "./symbol";
export class FunctionSymbol extends Symbol {
    public readonly type:string="function";

    public accessibility: Access;
    // 
    public returnType: TypeReference;
    // 
    public body: FunctionScope;
    // 
    public readonly overloads: FunctionSymbol[] = [];
    // 
    public isStatic: boolean = false;
    // 
    public readonly decorators: any[] = [];
    
}

Symbol.registerSymbol("Function", FunctionSymbol);
