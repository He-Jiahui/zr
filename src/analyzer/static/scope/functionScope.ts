import type { FunctionSymbol } from "../symbol/functionSymbol";
import type { GenericSymbol } from "../symbol/genericSymbol";
import type { ParameterSymbol } from "../symbol/parameterSymbol";
import { type Symbol, SymbolTable } from "../symbol/symbol";
import type { BlockScope } from "./blockScope";
import { Scope } from "./scope";

// 导出一个名为 FunctionScope 的类，该类继承自 Scope 类
export class FunctionScope extends Scope {
    public readonly type: string = "FunctionScope";
    
    public signature: FunctionSymbol;
    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    public args: ParameterSymbol | null = null;
    protected symbolTableList = [this.generics, this.parameters, this.args]; 
    public body: BlockScope;

    public addGeneric(generic: GenericSymbol | undefined): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addParameter(parameter: ParameterSymbol | undefined): boolean {
        const success = this.checkSymbolUnique(parameter) && this.parameters.addSymbol(parameter);
        
        return success;
    }

    public setArgs(args: ParameterSymbol | undefined): boolean {
        if (this.args == null) {
            return true;
        }
        this.args = null;
        const success = this.checkSymbolUnique(args!);
        if (success) {
            this.args = args ?? null;
            return true;
        }
        return false;
    }


    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.parameters.getSymbol(_symbol);
    }

}

Scope.registerScope("Function", FunctionScope);