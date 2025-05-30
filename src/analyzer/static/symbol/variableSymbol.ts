import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";

export class VariableSymbol extends Symbol {
    public readonly type: string = "variable";
    public typeRef: TypeReference;
    public defaultValue: any;//TODO: type
}

Symbol.registerSymbol("Variable", VariableSymbol);
