import {ScriptInfo} from "./scriptInfo";
import {FileRange, Start} from "../parser/generated/parser";
import type {Scope} from "../analyzer/static/scope/scope";
import type {Handler} from "../analyzer/semantic/common/handler";

export class ScriptContext {
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
    // only available when handler is calling Handle function
    public location: FileRange;

    public readonly _scopeStack: Scope[] = [];
    private readonly _handlerStack: Handler[] = [];

    public constructor(info: ScriptInfo) {
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
    }

    public pushHandler(currentHandler: Handler) {
        this._handlerStack.push(currentHandler);
    }

    public popHandler() {
        return this._handlerStack.pop();
    }


}
