
import type { StructScope } from '../scope/structScope';
import { Symbol } from './symbol';

export class StructSymbol extends Symbol {
    public readonly type: string = "struct";


    public table: StructScope;
}

Symbol.registerSymbol("Struct", StructSymbol);
