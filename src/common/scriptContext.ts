import {ScriptInfo} from "./scriptInfo";
import {FileRange, Start} from "../parser/generated/parser";
import type {Scope} from "../analyzer/static/scope/scope";
import type {Handler} from "../analyzer/semantic/common/handler";
import {TMaybeUndefined} from "../analyzer/utils/zrCompilerTypes";

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
