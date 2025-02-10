
import { ScriptInfo } from "./scriptInfo";
import { FileRange, Start } from "../parser/generated/parser";

export class ScriptContext{
    public compilingDirectory: string;

    public fileRelativePath: string;

    public encoding: BufferEncoding = "utf-8";
    // fill by resolver
    public fileName: string;

    public filePath: string;
    // fill by reader
    public scriptText: string;

    // fill by parser
    public syntaxErrorRange: FileRange;

    public ast: Start;

    public location: FileRange;

    public constructor(info: ScriptInfo){
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
    }
}