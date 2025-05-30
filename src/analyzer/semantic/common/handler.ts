import {ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";
import {NoHandlerError} from "../../../errors/noHandlerError";
import {FileRange} from "../../../parser/generated/parser";
import {Scope} from "../../static/scope/scope";
import {Symbol as SymbolDeclaration, SymbolOrSymbolArray, TSymbolOrSymbolArray} from "../../static/symbol/symbol";
import {TNullable, TSemanticType} from "../../utils/zrCompilerTypes";

export type AnyNode = {
    type: string;
    location: FileRange;
    [key: string | number | symbol]: any;
}

export class Handler extends ScriptContextAccessibleObject<ScriptContext> {
    private static handlers: Map<string, typeof Handler> = new Map();
    private static semanticHandlerMap: Map<TSemanticType<any>, Handler> = new Map();
    public value: TSemanticType<any>;
    public location: FileRange;
    protected _symbol: TNullable<SymbolDeclaration>;

    public constructor(context: ScriptContext) {
        super(context);
    }

    public get children(): Array<Handler> {
        return this._children.filter(child => child !== null).map(child => child!);
    }

    protected get _children(): Array<TNullable<Handler>> {
        return [];
    }

    public static registerHandler(nodeType: string, handler: typeof Handler) {
        Handler.handlers.set(nodeType, handler);
    }

    public static handle(node: AnyNode | any, context: ScriptContext): Handler {
        const handler = Handler.handlers.get(node.type)!;
        if (!handler) {
            new NoHandlerError(node.type, context).report();
            return null!;
        }
        const h = new handler(context);
        h.handleInternal(node);
        Handler.semanticHandlerMap.set(h.value, h);
        return h;
    }

    protected static getHandler(semanticType: any): TNullable<Handler> {
        if (!semanticType) {
            return null;
        }
        if (Handler.semanticHandlerMap.has(semanticType)) {
            return Handler.semanticHandlerMap.get(semanticType)!;
        } else {
            return null;
        }
    }

    public handleInternal(node: AnyNode | any): void {
        // clear previous value
        this.value = null;
        // set location
        const {location} = node;
        this.location = location;
        this.context.location = location;
        this.context.pushHandler(this);
        this._handle(node);
        this.context.popHandler();
    }

    public createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        return this._createSymbolAndScope(parentScope);
    }

    public collectDeclarations<T extends SymbolDeclaration>(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>): TSymbolOrSymbolArray<T> {
        this.context.pushHandler(this);
        const declarationSymbols = this._collectDeclarations(childrenSymbols, currentScope) as TSymbolOrSymbolArray<T>;
        this.context.popHandler();
        return declarationSymbols;
    }

    // handles node
    protected _handle(node: AnyNode | any): void {

    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        return null;
    }

    // collects
    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>): SymbolOrSymbolArray {
        return null;
    }

    protected declareSymbol<T extends SymbolDeclaration>(symbolName: string, symbolType: string, parentScope: TNullable<Scope>): TNullable<T> {
        const createdSymbol = SymbolDeclaration.createSymbol<T>(symbolName, symbolType, this, parentScope);
        this._symbol = createdSymbol;
        const createdScope = Scope.createScope(symbolType, parentScope, createdSymbol);
        if (createdSymbol) {
            createdSymbol.childScope = createdScope;
        }
        return createdSymbol;
    }
}
