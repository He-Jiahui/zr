
import { ScriptInfo } from "./scriptInfo";
import { FileRange, Start } from "../parser/generated/parser";
import { Scope } from "../analyzer/static/scope/scope";
import { Symbol } from "../analyzer/static/symbol/symbol";
import { ZrInternalError } from "../errors/zrInternalError";
import {Handler} from "../analyzer/semantic/common/handler";
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
    // only available when handler is calling Handle function
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

    private readonly _handlerStack: Handler[] = [];

    public pushHandler(currentHandler: Handler){
        this._handlerStack.push(currentHandler);
    }
    public popHandler(){
        return this._handlerStack.pop();
    }
    public get currentHandler(): Handler{
        return this._handlerStack[this._handlerStack.length - 1];
    }



    public declare<T extends Symbol>(symbolName: string | undefined, symbolType: string, location?: FileRange): T{
        const symbol = Symbol.createSymbol<T>(symbolType, symbolName);
        if(!symbol){
            new ZrInternalError(`Symbol ${symbolType} is not registered`, this).report(); // TODO: throw 
            return null!;
        }
        symbol.location = location ?? this.currentHandler.location;
        symbol.ownerScope = this._currentScope;
        symbol.context = this;
        this.currentSymbol = symbol;
        return symbol;
    }
    
}
