import {ZrIntermediateWritable} from "./writable";
import {ZrInstructionParamsFormat, ZrInstructionType} from "../instruction/instructions";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateInstruction extends ZrIntermediateWritable {
    public type: ZrInstructionType;
    // only support little endian now
    public value: number[] = [];

    public value1: number;
    public value2: number;
    public value3: number;
    public value4: number;

    toWriteData: IntermediateHeadType[] = [
        ["type", IntermediateValueType.UInt32]
    ];

    protected _preprocess() {
        const valueLength = ZrInstructionParamsFormat[this.type].length;
        // little endian
        let type = IntermediateValueType.Int32;
        this.value1 = this.value[0] || 0;
        if (valueLength === 2) {
            type = IntermediateValueType.UInt16;
            this.value2 = this.value[1] || 0;
            this.value3 = this.value[2] || 0;
        } else if (valueLength === 4) {
            type = IntermediateValueType.UInt8;
            this.value2 = this.value[1] || 0;
            this.value3 = this.value[2] || 0;
            this.value4 = this.value[3] || 0;
        }
        this.toWriteData.length = 1;
        for (let i = 0; i < valueLength; i++) {
            this.toWriteData.push([`value${i + 1}`, type]);
        }
    }

}
