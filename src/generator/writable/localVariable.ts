import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";
import {ZrIntermediateWritable} from "./writable";

export class ZrIntermediateLocalVariable extends ZrIntermediateWritable {
    public instructionStart: bigint;
    public instructionEnd: bigint;

    public startLine: bigint;
    public endLine: bigint;

    toWriteData: IntermediateHeadType[] = [
        ["startLine", IntermediateValueType.UInt64],
        ["endLine", IntermediateValueType.UInt64],
        ["instructionStart", IntermediateValueType.UInt64],
        ["instructionEnd", IntermediateValueType.UInt64]
    ];
}
