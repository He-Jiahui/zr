import type {GenericSymbol} from "../symbol/genericSymbol";
import type {ParameterSymbol} from "../symbol/parameterSymbol";
import {SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {Scope} from "./scope";
import {BlockSymbol} from "../symbol/blockSymbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

// 导出一个名为 FunctionScope 的类，该类继承自 Scope 类
export class FunctionScope extends Scope {
    public readonly type: string = ScopeKeywords.FunctionScope;

    public body: TNullable<BlockSymbol> = null;
    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected symbolTableList = [this.generics, this.parameters, () => this.body];

    public get genericSymbols() {
        return this.generics.getAllSymbols();
    }

    public addGeneric(generic: TSymbolOrSymbolArray<GenericSymbol>): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addParameter(parameter: TSymbolOrSymbolArray<ParameterSymbol>): boolean {
        const success = this.checkSymbolUnique(parameter) && this.parameters.addSymbol(parameter);
        return success;
    }


    public setBody(body: TSymbolOrSymbolArray<BlockSymbol>): void {
        if (body instanceof Array) {
            this.body = body[0];
        } else {
            this.body = body ?? null;
        }
    }


    protected _getSymbol(_symbol: string) {
        return this.parameters.getSymbol(_symbol);
    }

}

Scope.registerScope(Keywords.Function, FunctionScope);
