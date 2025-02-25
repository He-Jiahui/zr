import { AllType } from "../../semantic/types/types";
import type { EnumScope } from "../scope/enumScope";
import { Symbol } from "./symbol";

export class EnumSymbol extends Symbol {
    public readonly type:string = "enum";
    public superType: AllType;
    public table: EnumScope;
}

Symbol.registerSymbol("Enum", EnumSymbol);
