import {type Symbol, SymbolTable} from "../symbol/symbol";
import type {VariableSymbol} from "../symbol/variableSymbol";
import {Scope} from "./scope";
import type {BlockSymbol} from "../symbol/blockSymbol";

export class BlockScope extends Scope {
    public readonly type: string = "BlockScope";

    public info: BlockSymbol;

    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly subScopeSymbols: SymbolTable<Symbol> = new SymbolTable();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.variables, this.subScopeSymbols];


    public addVariable(variable: VariableSymbol | undefined) {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    public addSubScope(subScopes: Symbol | undefined) {
        const success = this.checkSymbolUnique(subScopes) && this.subScopeSymbols.addSymbol(subScopes);
        return success;
    }

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.variables.getSymbol(_symbol);
    }
}

Scope.registerScope("Block", BlockScope);