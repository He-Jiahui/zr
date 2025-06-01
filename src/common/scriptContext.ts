import {ScriptInfo} from "./scriptInfo";
import {FileRange, Start} from "../parser/generated/parser";
import type {Handler} from "../analyzer/semantic/common/handler";
import {TMaybeUndefined, TNullable} from "../analyzer/utils/zrCompilerTypes";
import type {Symbol as SymbolDeclaration} from "../analyzer/static/symbol/symbol";
import type {TypeDefinition} from "../analyzer/static/type/typeDefinition";

export class ScriptContextAccessibleObject<T extends (ScriptContext | TMaybeUndefined<ScriptContext>)> {
    private static readonly objectScriptContextMap: Map<any, ScriptContext> = new Map();

    public constructor(context: T) {
        if (context) {
            ScriptContextAccessibleObject.objectScriptContextMap.set(this, context);
        }
    }

    public get context(): T {
        return ScriptContextAccessibleObject.objectScriptContextMap.get(this) as T;
    }

    public set context(value: T) {

        if (ScriptContextAccessibleObject.objectScriptContextMap.has(this)) {
            if (value) {
                ScriptContextAccessibleObject.objectScriptContextMap.set(this, value);
            } else {
                ScriptContextAccessibleObject.objectScriptContextMap.delete(this);
            }
        }
    }

    public static removeContextRegistrationOfAll(context: ScriptContext) {
        const waitToDeleteRegistry: any[] = [];
        for (const [object, objectContext] of ScriptContextAccessibleObject.objectScriptContextMap.entries()) {
            if (objectContext === context) {
                waitToDeleteRegistry.push(object);
            }
        }
        for (const registry of waitToDeleteRegistry) {
            ScriptContextAccessibleObject.objectScriptContextMap.delete(registry);
        }
    }
}

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

    private readonly _handlerStack: Handler[] = [];

    private readonly _typeSymbolMap: Map<TypeDefinition<ScriptContext>, SymbolDeclaration> = new Map();
    private readonly _symbolTypeMap: Map<SymbolDeclaration, TypeDefinition<ScriptContext>> = new Map();

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

    public linkTypeAndSymbol(type: TypeDefinition<ScriptContext>, symbol: SymbolDeclaration) {
        this._typeSymbolMap.set(type, symbol);
        this._symbolTypeMap.set(symbol, type);
    }

    public getTypeFromSymbol(symbol: SymbolDeclaration): TNullable<TypeDefinition<ScriptContext>> {
        return this._symbolTypeMap.get(symbol) ?? null;
    }

    public getSymbolFromType(type: TypeDefinition<ScriptContext>): TNullable<SymbolDeclaration> {
        return this._typeSymbolMap.get(type) ?? null;
    }


}
