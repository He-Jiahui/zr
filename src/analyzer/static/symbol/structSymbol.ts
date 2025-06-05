import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class StructSymbol extends Symbol {
    public readonly type: string = Keywords.Struct;
}

Symbol.registerSymbol(Keywords.Struct, StructSymbol);
