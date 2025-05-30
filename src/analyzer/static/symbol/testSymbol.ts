import {Symbol} from "./symbol";

export class TestSymbol extends Symbol {
    public readonly type: string = "test";
}

Symbol.registerSymbol("Test", TestSymbol);
