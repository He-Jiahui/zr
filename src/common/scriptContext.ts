
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
    
    private _currentScope: Scope;
    public get currentScope(): Scope{
        return this._currentScope;
    }

    public currentSymbol: Symbol;

    private readonly _scopeStack: Scope[] = [];

    public constructor(info: ScriptInfo){
        this.compilingDirectory = info.compilingDirectory;
        this.fileRelativePath = info.fileRelativePath;
        this.encoding = info.encoding;
    }

    public pushScope<T extends Scope>(scopeType: string): T{
        const scope = Scope.createScope<T>(scopeType, this._currentScope);
        if(!scope){
            new ZrInternalError(`Scope ${scopeType} is not registered`, this).report(); // TODO: throw
            return null!;
        }
        if(this._currentScope){
            this._scopeStack.push(this._currentScope);
        }
        this._currentScope = scope;
        return scope;
    }

    public popScope(){
        if(this._scopeStack.length > 0){
            this._currentScope = this._scopeStack.pop()!;
        }else{
            this._currentScope = undefined!;
        }
    }

    public declare<T extends Symbol>(symbolName: string, symbolType: string, location?: FileRange): T{
        const symbol = Symbol.createSymbol<T>(symbolType, symbolName);
        if(!symbol){
            new ZrInternalError(`Symbol ${symbolType} is not registered`, this).report(); // TODO: throw 
            return null!;
        }
        symbol.location = location;
        symbol.ownerScope = this._currentScope;
        this.currentSymbol = symbol;
        return symbol;
    }
    
}