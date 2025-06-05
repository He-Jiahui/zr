import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class VariableSymbol extends Symbol {
    public readonly type: string = Keywords.Variable;
    public typeRef: TypeReference;
    public defaultValue: any;//TODO: type
}

Symbol.registerSymbol(Keywords.Variable, VariableSymbol);
