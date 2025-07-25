import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";
import {TypePlaceholder} from "../type/typePlaceholder";

export class IntermediateSymbol extends Symbol {
    public readonly type = Keywords.Intermediate;

    public returnType: TypePlaceholder;
}

Symbol.registerSymbol(Keywords.Intermediate, IntermediateSymbol);
