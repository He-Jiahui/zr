import { type Symbol, SymbolTable } from "../symbol/symbol";
import type { VariableSymbol } from "../symbol/variableSymbol";
import { Scope } from "./scope";

export class BlockScope extends Scope{
    public readonly type: string = "BlockScope";

    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.variables];

    protected readonly subScopes: Scope[] = [];
    public addVariable(variable: VariableSymbol | undefined){
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.variables.getSymbol(_symbol);
    }
}

Scope.registerScope("Block", BlockScope);