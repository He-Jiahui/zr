import { FunctionSymbol } from "../symbol/functionSymbol";
import { ParameterSymbol } from "../symbol/parameterSymbol";
import { Symbol, SymbolTable } from "../symbol/symbol";
import { Scope } from "./scope";

// 导出一个名为 FunctionScope 的类，该类继承自 Scope 类
export class FunctionScope extends Scope {
    public readonly type: string = "FunctionScope";

    public signature: FunctionSymbol;

    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.parameters]; 
    public body: Scope;

    public addParameter(parameter: ParameterSymbol): boolean {
        const success = this.checkSymbolUnique(parameter) && this.parameters.addSymbol(parameter);
        // todo: 这里预留了一个待办事项，可能用于后续添加更多的逻辑

        return success;
    }


    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.parameters.getSymbol(_symbol);
    }

}