import {Symbol} from './symbol';

export class StructSymbol extends Symbol {
    public readonly type: string = "struct";
}

Symbol.registerSymbol("Struct", StructSymbol);
