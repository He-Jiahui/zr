import {AllType} from "../../semantic/types/types";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class EnumSymbol extends Symbol {
    public readonly type: string = Keywords.Enum;
    public superType: AllType;
}

Symbol.registerSymbol(Keywords.Enum, EnumSymbol);
