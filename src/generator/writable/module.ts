import {ZrIntermediateWritable} from "./writable";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";
import {ZrIntermediateWriter} from "../writer/writer";
import * as CryptoJS from 'crypto-js';

export class ZrIntermediateModule extends ZrIntermediateWritable {
    public name: string;
    public md5: string;
    public readonly imports: ZrIntermediateImport[] = [];
    public readonly declares: ZrIntermediateDeclare[] = [];
    toWriteData: IntermediateHeadType[] = [
        ["name", IntermediateValueType.String],
        ["md5", IntermediateValueType.String],
        ["imports", IntermediateValueType.Writable],
        ["declares", IntermediateValueType.Writable]
    ];

    public addDeclare(type: ZrIntermediateDeclareType, declare: ZrIntermediateWritable): void {
        const declareWritable = new ZrIntermediateDeclare();
        declareWritable.type = type;
        declareWritable.data = declare;
        this.declares.push(declareWritable);
    }

    protected _preprocess() {
        this.md5 = "";
        const writer = new ZrIntermediateWriter();
        writer.writeAll(this);
        const wordArray = CryptoJS.lib.WordArray.create(writer.buffer);
        this.md5 = CryptoJS.MD5(wordArray).toString();
    }
}


export class ZrIntermediateImport extends ZrIntermediateWritable {
    public name: string;
    public md5: string;

    toWriteData: IntermediateHeadType[] = [
        ["name", IntermediateValueType.String],
        ["md5", IntermediateValueType.String]
    ];
}

export const enum ZrIntermediateDeclareType {
    Class = 0,
    Struct = 1,
    Interface = 2,
    Function = 3,
    Enum = 4,
    Field = 5,
}

export class ZrIntermediateDeclare extends ZrIntermediateWritable {
    public type: ZrIntermediateDeclareType;
    public data: any;
    toWriteData: IntermediateHeadType[] = [
        ["type", IntermediateValueType.Int32],
        ["data", IntermediateValueType.Writable, true]
    ];
}
