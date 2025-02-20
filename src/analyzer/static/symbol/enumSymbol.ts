import type { EnumScope } from "../scope/enumScope";
import { Symbol } from "./symbol";

export class EnumSymbol extends Symbol {
    public readonly type:string = "enum";
    
    public table: EnumScope;
}

Symbol.registerSymbol("Enum", EnumSymbol);
