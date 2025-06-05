import {FieldSymbol} from "./fieldSymbol";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class GenericSymbol extends FieldSymbol {
    public readonly type: string = Keywords.Generic;


}

Symbol.registerSymbol(Keywords.Generic, GenericSymbol);
