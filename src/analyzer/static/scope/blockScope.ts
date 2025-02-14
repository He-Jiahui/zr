import { SymbolTable } from "../symbol/symbol";
import { VariableSymbol } from "../symbol/variableSymbol";
import { Scope } from "./scope";

export class BlockScope extends Scope{
    public readonly type = "BlockScope";

    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();

    public addVariable(variableName: string, variableType?: any): VariableSymbol {
        const variable = new VariableSymbol(variableName);
        this.variables.addSymbol(variable);
        if(variableType){
            // TODO:
            // variable.setType(variableType);
        }
        return variable;
    }
}

Scope.registerScope("Block", BlockScope);