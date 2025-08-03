import {Keywords} from "../../../../types/keywords";
import {IdentifierType} from "../identifierHandler";
import {IntegerType} from "../../literals/integerHandler";
import {Handler} from "../../common/handler";
import {TMaybeArray, TNullable} from "../../../utils/zrCompilerTypes";
import {IntermediateInstruction} from "../../../../parser/generated/parser";
import {ZrInstructionContext, ZrInstructionParam} from "../../../../generator/instruction/instruction";
import {ZrInstructionTypeNameMap} from "../../../../generator/instruction/instructions";
import {ZrInternalError} from "../../../../errors/zrInternalError";

export type InstructionType = {
    type: Keywords.Instruction,
    name: IdentifierType,
    values: (IdentifierType | IntegerType)[],
};


export class InstructionHandler extends Handler {
    public value: InstructionType;
    private nameHandler: TNullable<Handler> = null;
    private readonly valueHandlers: Handler[] = [];

    protected get _children(): Array<TNullable<Handler>> {
        return [this.nameHandler, ...this.valueHandlers];
    }

    protected _handle(node: IntermediateInstruction) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        this.valueHandlers.length = 0;
        if (node.values) {
            for (const value of node.values) {
                this.valueHandlers.push(Handler.handle(value.value, this.context));
            }
        }
        this.value = {
            type: Keywords.Instruction,
            name: this.nameHandler.value,
            values: this.valueHandlers.map(v => v.value)
        };
    }

    protected _generateInstruction(children: ZrInstructionContext[]): TNullable<TMaybeArray<ZrInstructionContext>> {
        const instructionName = this.value.name.name.toLowerCase();
        if (ZrInstructionTypeNameMap.has(instructionName)) {
            const instruction = ZrInstructionTypeNameMap.get(instructionName)!;
            const value = this.value.values.map(v => {
                if (v.type === Keywords.Identifier) {
                    return new ZrInstructionParam(Keywords.Identifier, v.name);
                } else if (v.type === Keywords.IntegerLiteral) {
                    return new ZrInstructionParam(Keywords.Integer, Number(v.value));
                }
                return null;
            }).filter(v => v !== null);
            return ZrInstructionContext.createSingle(instruction, ...value);
        } else {
            new ZrInternalError(`Instruction ${instructionName} not found`, this.context).report();
            return null;
        }
    }


}

Handler.registerHandler(Keywords.IntermediateInstruction, InstructionHandler);
