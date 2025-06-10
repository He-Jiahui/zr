import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";
import {TypePlaceholder} from "../type/typePlaceholder";

export class VariableSymbol extends Symbol {
    public readonly type: string = Keywords.Variable;

    public typePlaceholder: TypePlaceholder;

    public typeRef: TypeReference;

    public defaultValue: any;//TODO: type
}

Symbol.registerSymbol(Keywords.Variable, VariableSymbol);
