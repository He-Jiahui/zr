import {Access} from "../../../types/access";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";
import {TypePlaceholder} from "../type/typePlaceholder";

export class FunctionSymbol extends Symbol {
    public readonly type: string = Keywords.Function;

    public accessibility: Access;
    // 
    public returnType: TypePlaceholder;
    // 
    public readonly overloads: FunctionSymbol[] = [];
    // 
    public isStatic: boolean = false;
    // 
    public readonly decorators: any[] = [];

}

Symbol.registerSymbol(Keywords.Function, FunctionSymbol);
