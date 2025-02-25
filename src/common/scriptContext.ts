
import { ScriptInfo } from "./scriptInfo";
import { FileRange, Start } from "../parser/generated/parser";
import { Scope } from "../analyzer/static/scope/scope";
import { Symbol } from "../analyzer/static/symbol/symbol";
import { ZrInternalError } from "../errors/zrInternalError";
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

    // fill by static analyzer
    
    public _currentScope: Scope;
    public get currentScope(): Scope{
        return this._currentScope;
    }

    public currentSymbol: Symbol;

    public readonly _scopeStack: Scope[] = [];

    public constructor(info: ScriptInfo){
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
    }



    public declare<T extends Symbol>(symbolName: string | undefined, symbolType: string, location?: FileRange): T{
        const symbol = Symbol.createSymbol<T>(symbolType, symbolName);
        if(!symbol){
            new ZrInternalError(`Symbol ${symbolType} is not registered`, this).report(); // TODO: throw 
            return null!;
        }
        symbol.location = location;
        symbol.ownerScope = this._currentScope;
        symbol.context = this;
        this.currentSymbol = symbol;
        return symbol;
    }
    
}