import { Symbol, SymbolTable } from "../symbol/symbol";
import { VariableSymbol } from "../symbol/variableSymbol";
import { Scope } from "./scope";

export class BlockScope extends Scope{
    public readonly type: string = "BlockScope";

    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.variables];
    public addVariable(variable: VariableSymbol){
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.variables.getSymbol(_symbol);
    }
}

Scope.registerScope("Block", BlockScope);