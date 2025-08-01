import {ZrIntermediateWritable} from "./writable";
import {ZrIntermediateType} from "../instruction/literals";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateConstantValue extends ZrIntermediateWritable {
    public type: ZrIntermediateType;
    public data: any;
    public startLine: number = 0;
    public endLine: number = 0;

    toWriteData: IntermediateHeadType[] = [
        ["type", IntermediateValueType.UInt64],
        ["data", IntermediateValueType.Null],
        ["startLine", IntermediateValueType.UInt64],
        ["endLine", IntermediateValueType.UInt64]
    ];

    protected _preprocess() {
        const dataIndex = this.toWriteData[1];
        switch (this.type) {
            case ZrIntermediateType.Null: {
                dataIndex[1] = IntermediateValueType.Empty;
            }
                break;
            case ZrIntermediateType.Bool: {
                dataIndex[1] = IntermediateValueType.Bool;
            }
                break;
            case ZrIntermediateType.Int64:
            case ZrIntermediateType.Int32:
            case ZrIntermediateType.Int16:
            case ZrIntermediateType.Int8: {
                dataIndex[1] = IntermediateValueType.Int64;
            }
                break;
            case ZrIntermediateType.UInt64:
            case ZrIntermediateType.UInt32:
            case ZrIntermediateType.UInt16:
            case ZrIntermediateType.UInt8: {
                dataIndex[1] = IntermediateValueType.UInt64;
            }
                break;
            case ZrIntermediateType.Float:
            case ZrIntermediateType.Double: {
                dataIndex[1] = IntermediateValueType.Double;
            }
                break;
            case ZrIntermediateType.String: {
                dataIndex[1] = IntermediateValueType.String;
            }
                break;
            default: {
                // todo unsupported type
            }
        }
    }
}
