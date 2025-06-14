import {ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";
import {DuplicatedIdentifierError} from "../../../errors/duplicatedIdentifierError";
import {FileRange} from "../../../parser/generated/parser";
import type {Scope} from "../scope/scope";
import {TMaybeArray, TMaybeUndefined, TNullable} from "../../utils/zrCompilerTypes";
import {ZrInternalError} from "../../../errors/zrInternalError";
import type {Handler} from "../../semantic/common/handler";
import {MetaType} from "../type/meta/metaType";
import {Keywords, SpecialSymbols} from "../../../types/keywords";

export class Symbol extends ScriptContextAccessibleObject<ScriptContext> {
    private static readonly symbolMap: Map<string, typeof Symbol> = new Map<string, typeof Symbol>();
    public readonly type: string;
    public name: TMaybeUndefined<string>;
    public ownerScope: TNullable<Scope>; // TODO: owner scope
    public childScope: TNullable<Scope>;
    public location?: FileRange;
    // if symbols has sub symbols, like destruction patterns symbol
    public readonly subSymbols: Symbol[] = [];

    public generatedType: MetaType<any>;

    constructor(name: TMaybeUndefined<string>, context: ScriptContext) {
        super(context);
        this.name = name;
    }

    public get handler() {
        const context = this.context;
        return context.getHandlerFromSymbol(this);
    }

    public get relevantType() {
        const context = this.context;
        return context.getTypeFromSymbol(this);
    }

    public static registerSymbol(symbolType: string, symbol: typeof Symbol) {
        Symbol.symbolMap.set(symbolType, symbol);
    }

    public static createSymbol<T extends Symbol>(symbolName: string | undefined, symbolType: string, handler: Handler, parentScope: TNullable<Scope>, location?: FileRange): TNullable<T> {
        const symbolClass = Symbol.symbolMap.get(symbolType);
        if (!symbolClass) {
            return null;
        }
        const context: ScriptContext = handler.context;
        const symbol = new symbolClass(symbolName, context) as T;

        if (!symbol) {
            new ZrInternalError(`Symbol ${symbolType} is not registered`, context).report(); // TODO: throw
            return null;
        }
        symbol.location = location ?? handler.location;
        symbol.ownerScope = parentScope;

        context.linkSymbolAndHandler(symbol, handler);

        const symbolCreatedType = MetaType.createType(symbol.type, symbol);
        if (symbolCreatedType) {
            context.linkTypeAndSymbol(symbolCreatedType, symbol);
        }

        return symbol;
    }

}

export type SymbolOrSymbolArray = TNullable<TMaybeArray<Symbol>>;

export type TSymbolOrSymbolArray<T extends Symbol> = TNullable<TMaybeArray<T>>;

export function checkSymbolOrSymbolArray<T extends Symbol>(symbolOrSymbolSet: TSymbolOrSymbolArray<T>, predicate: (symbol: T) => boolean): boolean {
    if (!symbolOrSymbolSet) {
        return true;
    }
    if (symbolOrSymbolSet instanceof Array) {
        let allCheckPass = true;
        for (const symbol of symbolOrSymbolSet) {
            allCheckPass &&= predicate(symbol);
        }
        return allCheckPass;
    } else {
        return predicate(symbolOrSymbolSet);
    }
}

export class SymbolTable<T extends Symbol> {
    public location: FileRange;
    private readonly symbolTable: T[] = [];

    constructor() {

    }

    public addSymbol(symbol: TSymbolOrSymbolArray<T>): boolean {
        return checkSymbolOrSymbolArray(symbol, (symbol) => {
            if (symbol.type === Keywords.Function) {
                // TODO: Function Symbol We need to check its signature in type check round, it can be overloaded
                // so we pass the check here
                this.symbolTable.push(symbol);
                return true;
            }
            // variable destruction pattern can have multiple symbols with names, we should check all of them
            if (!symbol.name) {
                let finalResult = true;
                for (const subSymbol of symbol.subSymbols) {
                    const result = this.addSymbol(subSymbol as T);
                    finalResult = result && finalResult;
                }
                return finalResult;
            }
            // if the symbol is block symbol, we should add it to the symbol table without checking
            if (symbol.name === SpecialSymbols.Block) {
                this.symbolTable.push(symbol);
                return true;
            }
            // if the symbol is try cache finally symbol, we should add it to the symbol table without checking
            if (symbol.name === SpecialSymbols.TryCatchFinallyBlock) {
                this.symbolTable.push(symbol);
                return true;
            }
            // if the symbol is lambda symbol, we should add it to the symbol table without checking
            if (symbol.name === SpecialSymbols.Lambda) {
                this.symbolTable.push(symbol);
                return true;
            }
            const duplicatedCheckIndex = this.symbolTable.findIndex(s => s.name === symbol.name);
            if (duplicatedCheckIndex === -1) {
                this.symbolTable.push(symbol);
                return true;
            } else {
                const conflictSymbol = this.symbolTable[duplicatedCheckIndex];
                reportDuplicatedSymbol(symbol, conflictSymbol);
            }
            return true;
        });
    }

    // not for function symbol table
    public getSymbol(name: TMaybeUndefined<string>) {
        // TODO: if this symbol table is not for function
        return this.symbolTable.find(s => s.name === name) ?? null;
    }

    // for function symbol table
    public getSymbols(name: string) {
        // TODO: if this symbol table is for function
        return this.symbolTable.filter(s => s.name === name);
    }

    public getAllSymbols() {
        return this.symbolTable;
    }
}

export function reportDuplicatedSymbol(triggerSymbol: Symbol, conflictSymbol: Symbol) {
    // TODO: check duplicated identifier
    // before throw error, we should set the location of the symbol to the duplicated symbol
    if (triggerSymbol.context) {
        triggerSymbol.context.location = triggerSymbol.location!;
    }
    new DuplicatedIdentifierError(triggerSymbol.name!, triggerSymbol.context, conflictSymbol.location).report();
}
