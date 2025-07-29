import {ZrIntermediateWritable} from "./writable";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateFunction extends ZrIntermediateWritable {
    public name: string;
    public startLine: number;
    public endLine: number;
    public parameterLength: number;
    public hasVarArgs: number;
    public readonly instructions: any[] = [];
    public readonly localVariables: any[] = [];
    public readonly constantVariables: any[] = [];
    public readonly closureVariables: any[] = [];
    public readonly debugInfos: any[] = [];

    toWriteData: IntermediateHeadType[] = [
        ["name", IntermediateValueType.String],
        ["startLine", IntermediateValueType.UInt64],
        ["endLine", IntermediateValueType.UInt64],
        ["parameterLength", IntermediateValueType.UInt64],
        ["hasVarArgs", IntermediateValueType.UInt64],
        ["instructions", IntermediateValueType.Writable],
        ["localVariables", IntermediateValueType.Writable],
        ["constantVariables", IntermediateValueType.Writable],
        ["closureVariables", IntermediateValueType.Writable],
        ["debugInfos", IntermediateValueType.Writable]
    ];
}
