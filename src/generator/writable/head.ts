import {ZrIntermediateWritable} from "./writable";
import {IntermediateHeadType, IntermediateValueType} from "../type/valueType";
import type {ZrIntermediateModule} from "./module";

export class ZrIntermediateHead extends ZrIntermediateWritable {
    public readonly signature = "\x01ZR\x02";
    public readonly versionMajor = 0;
    public readonly versionMinor = 0;
    public readonly versionPatch = 1;
    public readonly format: bigint;
    public readonly nativeIntSize = 8;
    public readonly sizeTypeSize = 8;
    public readonly instructionSize = 8;
    public readonly endianness = false;
    public readonly debug = false;
    public readonly opt1 = 0;
    public readonly opt2 = 0;
    public readonly opt3 = 0;
    public readonly modules: Array<ZrIntermediateModule> = [];


    toWriteData: IntermediateHeadType[] = [
        ["signature", IntermediateValueType.Binary, 4],
        ["versionMajor", IntermediateValueType.Int32],
        ["versionMinor", IntermediateValueType.Int32],
        ["versionPatch", IntermediateValueType.Int32],
        ["format", IntermediateValueType.Int64],
        ["nativeIntSize", IntermediateValueType.Int8],
        ["sizeTypeSize", IntermediateValueType.Int8],
        ["instructionSize", IntermediateValueType.Int8],
        ["endianness", IntermediateValueType.Bool],
        ["debug", IntermediateValueType.Bool],
        ["opt1", IntermediateValueType.Int32],
        ["opt2", IntermediateValueType.Int32],
        ["opt3", IntermediateValueType.Int32],
        ["modules", IntermediateValueType.Writable]
    ];

    constructor() {
        super();
        this.format = BigInt(this.versionMajor) << BigInt(32) | BigInt(this.versionMinor);
    }

    public addModule(module: ZrIntermediateModule) {
        this.modules.push(module);
    }


}
