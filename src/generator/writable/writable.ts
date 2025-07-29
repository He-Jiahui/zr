import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";

export class ZrIntermediateWritable {
    public toWriteData: IntermediateHeadType[] = [];

    public preprocess() {
        for (const writeData of this.toWriteData) {
            if (writeData[1] === IntermediateValueType.Writable) {
                const isArray = !writeData[2];
                const data = (this as any)[writeData[0]] as any;
                if (isArray) {
                    const dataArr = data as ZrIntermediateWritable[];
                    for (let i = 0; i < dataArr.length; i++) {
                        dataArr[i].preprocess();
                    }
                } else {
                    const dataSingle = data as ZrIntermediateWritable;
                    dataSingle.preprocess();
                }
            }
        }
        this._preprocess();
    }

    protected _preprocess() {

    }
}
