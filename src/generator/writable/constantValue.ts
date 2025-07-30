import {ZrIntermediateWritable} from "./writable";
import {ZrIntermediateType} from "../instruction/literals";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateConstantValue extends ZrIntermediateWritable {
    public type: ZrIntermediateType;
    public data: any;
    public startLine: number;
    public endLine: number;

    toWriteData: IntermediateHeadType[] = [
        ["type", IntermediateValueType.UInt64],
        ["data", IntermediateValueType.Writable],
        ["startLine", IntermediateValueType.UInt64],
        ["endLine", IntermediateValueType.UInt64]
    ];
}
