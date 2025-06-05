import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class TrySymbol extends Symbol {
    public readonly type: string = Keywords.Try;
}

Symbol.registerSymbol(Keywords.Try, TrySymbol);
