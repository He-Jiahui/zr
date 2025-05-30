import {Access} from "../../../types/access";
import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";

export class FunctionSymbol extends Symbol {
    public readonly type: string = "function";

    public accessibility: Access;
    // 
    public returnType: TypeReference;
    // 
    public readonly overloads: FunctionSymbol[] = [];
    // 
    public isStatic: boolean = false;
    // 
    public readonly decorators: any[] = [];

}

Symbol.registerSymbol("Function", FunctionSymbol);
