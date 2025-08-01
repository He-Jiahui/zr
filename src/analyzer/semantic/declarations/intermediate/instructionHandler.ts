import {Keywords} from "../../../../types/keywords";
import {IdentifierType} from "../identifierHandler";
import {IntegerType} from "../../literals/integerHandler";
import {Handler} from "../../common/handler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {IntermediateInstruction} from "../../../../parser/generated/parser";

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
    }


}

Handler.registerHandler(Keywords.IntermediateInstruction, InstructionHandler);
