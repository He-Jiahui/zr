import {ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";
import {NoHandlerError} from "../../../errors/noHandlerError";
import {FileRange} from "../../../parser/generated/parser";
import {Scope} from "../../static/scope/scope";
import {Symbol as SymbolDeclaration, SymbolOrSymbolArray, TSymbolOrSymbolArray} from "../../static/symbol/symbol";
import {TMaybeArray, TNullable, TSemanticType} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeDefinition} from "../../static/type/typeDefinition";
import {ZrIntermediateWritable} from "../../../generator/writable/writable";

export type AnyNode = {
    type: string;
    location: FileRange;
    [key: string | number | symbol]: any;
}

export class Handler extends ScriptContextAccessibleObject<ScriptContext> {
    private static readonly handlers: Map<string, typeof Handler> = new Map();
    public value: TSemanticType<any>;
    public location: FileRange;
    public generatedWritable: TNullable<ZrIntermediateWritable> = null;
    protected _currentScope: TNullable<Scope>;

    public constructor(context: ScriptContext) {
        super(context);
    }

    public get symbol() {
        return this.context.getSymbolFromHandler(this);
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
        h._handleInternal(node);
        return h;
    }

    public signByParentHandler(sign: string) {
        this._signByParentHandler(sign);
    }

    public createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        this._currentScope = parentScope;
        return this._createSymbolAndScope(parentScope);
    }

    public collectDeclarations<T extends SymbolDeclaration>(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>): TSymbolOrSymbolArray<T> {
        this.context.pushHandler(this);
        this._currentScope = currentScope ?? this._currentScope;
        const declarationSymbols = this._collectDeclarations(childrenSymbols, currentScope) as TSymbolOrSymbolArray<T>;
        this.context.popHandler();
        return declarationSymbols;
    }

    public inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return this._inferType(upperTypeInferContext);
    }

    public inferTypeBack(childrenContexts: Array<TypeInferContext>, currentInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return this._inferTypeBack(childrenContexts, currentInferContext);
    }

    public assignType(childrenContexts: Array<TypeAssignContext>): TNullable<TMaybeArray<TypeAssignContext>> {
        return this._assignType(childrenContexts);
    }

    public generateWritable() {
        return this._generateWritable();
    }

    protected declareSymbol<T extends SymbolDeclaration>(symbolName: string, symbolType: string, parentScope: TNullable<Scope>): TNullable<T> {
        const createdSymbol = SymbolDeclaration.createSymbol<T>(symbolName, symbolType, this, parentScope);
        const createdScope = Scope.createScope(symbolType, parentScope, createdSymbol);
        if (createdSymbol) {
            createdSymbol.childScope = createdScope;
        }
        return createdSymbol;
    }

    protected findSymbolInScope(symbolName: string): TNullable<SymbolDeclaration> {
        if (this._currentScope) {
            return this._currentScope.getSymbol(symbolName);
        } else {
            return null;
        }
    }

    protected findTypeInScope(typeName: string): TNullable<TypeDefinition<any>> {
        if (this._currentScope) {
            return this._currentScope.getType(typeName);
        } else {
            return null;
        }
    }

    protected _signByParentHandler(sign: string) {

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

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return null;
    }

    protected _inferTypeBack(childrenContexts: Array<TypeInferContext>, currentInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return null;
    }

    protected _assignType(childrenContexts: Array<TypeAssignContext>): TNullable<TMaybeArray<TypeAssignContext>> {
        return null;
    }

    protected _generateWritable(): TNullable<ZrIntermediateWritable> {
        return null;
    }

    private _handleInternal(node: AnyNode): void {
        // clear previous value
        this.value = null;
        // set location
        const location = node.location;
        this.location = location;
        this.context.location = location;
        this.context.pushHandler(this);
        this._handle(node);
        this.context.linkValueAndHandler(this.value, this);
        this.context.popHandler();
    }
}
