import {ZrIntermediateWritable} from "./writable";
import {ZrInstructionType} from "../instruction/instructions";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateInstruction extends ZrIntermediateWritable {
    public type: ZrInstructionType;
    public value: number;
    toWriteData: IntermediateHeadType[] = [
        ["instruction", IntermediateValueType.UInt64]
    ];

    public get instruction() {
        return (BigInt(this.type) << 32n) | BigInt(this.value);
    }
}
