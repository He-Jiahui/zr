import type {FunctionSymbol} from "../symbol/functionSymbol";
import type {GenericSymbol} from "../symbol/genericSymbol";
import type {ParameterSymbol} from "../symbol/parameterSymbol";
import {checkSymbolOrSymbolSet, type Symbol, SymbolTable, TSymbolOrSymbolSet} from "../symbol/symbol";
import {Scope} from "./scope";
import {BlockSymbol} from "../symbol/blockSymbol";

// 导出一个名为 FunctionScope 的类，该类继承自 Scope 类
export class FunctionScope extends Scope {
    public readonly type: string = "FunctionScope";

    public signature: FunctionSymbol;
    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    public args: ParameterSymbol | null = null;
    public body: BlockSymbol | null = null;
    protected symbolTableList = [this.generics, this.parameters, () => this.args, () => this.body];

    public addGeneric(generic: TSymbolOrSymbolSet<GenericSymbol>): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addParameter(parameter: TSymbolOrSymbolSet<ParameterSymbol>): boolean {
        const success = this.checkSymbolUnique(parameter) && this.parameters.addSymbol(parameter);
        return success;
    }

    public setArgs(args: TSymbolOrSymbolSet<ParameterSymbol>): boolean {
        return checkSymbolOrSymbolSet(args, (args)=>{
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
        });
    }

    public setBody(body: TSymbolOrSymbolSet<BlockSymbol>): void {
        if(body instanceof Array){
            this.body = body[0];
        }else{
            this.body = body ?? null;
        }
    }


    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.parameters.getSymbol(_symbol);
    }

}

Scope.registerScope("Function", FunctionScope);
