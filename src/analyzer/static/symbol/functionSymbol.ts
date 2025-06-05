import {Access} from "../../../types/access";
import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class FunctionSymbol extends Symbol {
    public readonly type: string = Keywords.Function;

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

Symbol.registerSymbol(Keywords.Function, FunctionSymbol);
