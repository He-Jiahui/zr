import {ZrInstructionType} from "./instructions";
import {TNullable} from "../../analyzer/utils/zrCompilerTypes";

export class ZrInstructionContext {
    public readonly instructions: ZrInstruction[] = [];

    public static createSingle(type: ZrInstructionType, ...params: any[]) {
        const ins = new ZrInstruction();
        ins.type = type;
        ins.op.push(...params);
        const insSet = new ZrInstructionContext();
        insSet.addInstruction(ins);
        return insSet;
    }

    public addInstruction(instruction: ZrInstruction) {
        this.instructions.push(instruction);
    }

    public merge(...params: Array<TNullable<ZrInstructionContext>>) {
        for (const set of params) {
            if (set) {
                this.instructions.push(...set.instructions);
            }
        }
    }
}

export class ZrInstruction {
    public type: ZrInstructionType;

    public readonly op: any[] = [];
}
