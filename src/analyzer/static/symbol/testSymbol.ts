import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class TestSymbol extends Symbol {
    public readonly type: string = Keywords.Test;
}

Symbol.registerSymbol(Keywords.Test, TestSymbol);
