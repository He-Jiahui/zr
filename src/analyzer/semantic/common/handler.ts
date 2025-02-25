import { ScriptContext } from "../../../common/scriptContext";
import { NoHandlerError } from "../../../errors/noHandlerError";
import { ZrInternalError } from "../../../errors/zrInternalError";
import { FileRange } from "../../../parser/generated/parser";
import { Scope } from "../../static/scope/scope";
import type { Symbol as SymbolDeclaration } from "../../static/symbol/symbol";

export type AnyNode = {
    type: string;
    location: FileRange;
    [key: string|number|symbol]: any;
}

export class Handler{
    private static handlers: Map<string, typeof Handler> = new Map();
    private static semanticHandlerMap: Map<any, Handler> = new Map();
    public static registerHandler(nodeType: string, handler: typeof Handler){
        Handler.handlers.set(nodeType, handler);
    }
    public static handle(node: AnyNode|any, context: ScriptContext): Handler{
        const handler = Handler.handlers.get(node.type)!;
        if(!handler){
            new NoHandlerError(node.type, context).report();
            return null!;
        }
        const h = new handler(context);
        h.handleInternal(node);
        Handler.semanticHandlerMap.set(h.value, h);
        return h;
    }

    protected static getHandler(semanticType: any): Handler | null{
        if(!semanticType){
            return null;
        }
        if(Handler.semanticHandlerMap.has(semanticType)){
            return Handler.semanticHandlerMap.get(semanticType)!;
        } else{
            return null;
        }
    }
    public context: ScriptContext;
    public value: any;

    public location: FileRange;
    public constructor(context: ScriptContext){
        this.context = context;
    }

    public handleInternal(node: AnyNode|any):void{
        // clear previous value
        this.value = null;
        // set location
        const { location } = node;
        this.location = location;
        this.context.location = location;
        this._handle(node);
    }
    // handles node
    protected _handle(node: AnyNode|any):void{

    }

    


    public collectDeclarations<T extends SymbolDeclaration>(): T|undefined{
        return this._collectDeclarations() as T;
    }
    // collects 
    protected _collectDeclarations(): SymbolDeclaration|undefined{
        return undefined;
    }

    protected pushScope<T extends Scope>(scopeType: string): T{
        const context = this.context;
        const scope = Scope.createScope<T>(scopeType, context._currentScope);
        if(!scope){
            new ZrInternalError(`Scope ${scopeType} is not registered`, context).report(); // TODO: throw
            return null!;
        }
        if(context._currentScope){
            context._scopeStack.push(context._currentScope);
        }
        context._currentScope = scope;
        return scope;
    }

    protected popScope(){
        const context = this.context;
        if(context._scopeStack.length > 0){
            context._currentScope = context._scopeStack.pop()!;
        }else{
            context._currentScope = undefined!;
        }
    }
}

