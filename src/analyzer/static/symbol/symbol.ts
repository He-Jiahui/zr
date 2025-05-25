import {ScriptContext} from "../../../common/scriptContext";
import {DuplicatedIdentifierError} from "../../../errors/duplicatedIdentifierError";
import {FileRange} from "../../../parser/generated/parser";
import type {Scope} from "../scope/scope";
import {Handler} from "../../semantic/common/handler";

export class Symbol {
    private static readonly symbolMap: Map<string, typeof Symbol> = new Map<string, typeof Symbol>();

    public static registerSymbol(symbolType: string, symbol: typeof Symbol) {
        Symbol.symbolMap.set(symbolType, symbol);
    }

    public static createSymbol<T extends Symbol>(symbolType: string, name: string | undefined): T {
        const symbol = Symbol.symbolMap.get(symbolType);
        if (!symbol) {
            return null!;
        }
        return new symbol(name) as T;
    }

    public readonly type: string;
    public name: string | undefined;
    public ownerScope: Scope; // TODO: owner scope
    public location?: FileRange;
    public context: ScriptContext;
    // if symbols has sub symbols, like destruction patterns symbol
    public readonly subSymbols: Symbol[] = [];

    constructor(name: string | undefined) {
        this.name = name;
    }
}

export type SymbolOrSymbolSet = Symbol | Symbol[] | undefined;

export type TSymbolOrSymbolSet<T extends Symbol> = T | T[] | undefined;

export function makeSymbolSet(...handlers: (Handler | null)[]) {
    const symbolSet: Symbol[] = [];
    for (const handler of handlers) {
        const symbol = handler?.collectDeclarations();
        if (symbol instanceof Array) {
            symbolSet.push(...symbol);
        }else if (symbol){
            symbolSet.push(symbol);
        }
    }
    return symbolSet;
}

export function checkSymbolOrSymbolSet<T extends Symbol>(symbolOrSymbolSet: TSymbolOrSymbolSet<T>, predicate: (symbol: T) => boolean): boolean {
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
    private readonly symbolTable: T[] = [];

    public location: FileRange;

    constructor() {

    }

    public addSymbol(symbol: TSymbolOrSymbolSet<T>): boolean {
        if (!symbol) {
            return false;
        }
        let symbolSet: T[];
        if (symbol instanceof Array) {
            symbolSet = symbol;
        } else {
            symbolSet = [symbol];
        }
        for (const symbol of symbolSet) {
            if (symbol.type === "Function") {
                // TODO: Function Symbol We need to check its signature in type check round, it can be overloaded
                // so we pass the check here
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

            const duplicatedCheckIndex = this.symbolTable.findIndex(s => s.name === symbol.name);
            if (duplicatedCheckIndex === -1) {
                this.symbolTable.push(symbol);
                return true;
            } else {
                const conflictSymbol = this.symbolTable[duplicatedCheckIndex];
                reportDuplicatedSymbol(symbol, conflictSymbol);
            }
        }

        return false;
    }

    // not for function symbol table
    public getSymbol(name: string | undefined) {
        // TODO: if this symbol table is not for function
        return this.symbolTable.find(s => s.name === name);
    }

    // for function symbol table
    public getSymbols(name: string) {
        // TODO: if this symbol table is for function
        return this.symbolTable.filter(s => s.name === name);
    }
}

export function reportDuplicatedSymbol(triggerSymbol: Symbol, conflictSymbol: Symbol) {
    // TODO: check duplicated identifier
    // before throw error, we should set the location of the symbol to the duplicated symbol
    triggerSymbol.context.location = triggerSymbol.location!;
    new DuplicatedIdentifierError(triggerSymbol.name!, triggerSymbol.context, conflictSymbol.location).report();
}
