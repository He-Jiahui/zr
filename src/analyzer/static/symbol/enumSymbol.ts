import {AllType} from "../../semantic/types/types";
import {Symbol} from "./symbol";

export class EnumSymbol extends Symbol {
    public readonly type: string = "enum";
    public superType: AllType;
}

Symbol.registerSymbol("Enum", EnumSymbol);
