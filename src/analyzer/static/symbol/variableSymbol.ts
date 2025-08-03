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

    public startInstructionIndex: number = -1;
    public endInstructionIndex: number = -1;

    public defaultValue: any;//TODO: type

    public registerInstructionUsage(instructionIndex: number) {
        if (this.startInstructionIndex < 0) {
            this.startInstructionIndex = instructionIndex;
        }
        if (this.endInstructionIndex < 0) {
            this.endInstructionIndex = instructionIndex;
        }

        this.startInstructionIndex = Math.min(this.startInstructionIndex, instructionIndex);
        this.endInstructionIndex = Math.max(this.endInstructionIndex, instructionIndex);
    }

}

Symbol.registerSymbol(Keywords.Variable, VariableSymbol);
