import type {TypeReference} from "../type/typeReference";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";
import {TypePlaceholder} from "../type/typePlaceholder";
import {ZrIntermediateType} from "../../../generator/instruction/literals";

export class VariableSymbol extends Symbol {
    public readonly type: string = Keywords.Variable;
    public invariant: string = "";

    public typePlaceholder: TypePlaceholder;

    public typeRef: TypeReference;

    public basicType: ZrIntermediateType;

    public startLine: number;
    public endLine: number;

    public index: number;

    public defaultValue: any;//TODO: type
}

Symbol.registerSymbol(Keywords.Variable, VariableSymbol);
