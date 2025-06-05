import {type Symbol, SymbolOrSymbolArray, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import type {VariableSymbol} from "../symbol/variableSymbol";
import {Scope} from "./scope";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class BlockScope extends Scope {
    public readonly type: string = ScopeKeywords.BlockScope;

    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly subScopeSymbols: SymbolTable<Symbol> = new SymbolTable();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.variables, this.subScopeSymbols];


    public addVariable(variable: TSymbolOrSymbolArray<VariableSymbol>) {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    public addSubScope(subScopes: SymbolOrSymbolArray) {
        const success = this.subScopeSymbols.addSymbol(subScopes);
        return success;
    }

    protected _getSymbol(_symbol: string) {
        return this.variables.getSymbol(_symbol);
    }
}

Scope.registerScope(Keywords.Block, BlockScope);
