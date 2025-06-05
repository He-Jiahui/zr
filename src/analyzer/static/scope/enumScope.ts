import {type Symbol, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import type {VariableSymbol} from "../symbol/variableSymbol";
import {Scope} from "./scope";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class EnumScope extends Scope {
    public readonly type: string = ScopeKeywords.EnumScope;

    // 枚举类型
    private readonly enumMembers: SymbolTable<VariableSymbol> = new SymbolTable<VariableSymbol>();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.enumMembers];


    public addMember(member: TSymbolOrSymbolArray<VariableSymbol>): boolean {
        return this.checkSymbolUnique(member) && this.enumMembers.addSymbol(member);
    }

    protected _getSymbol(_symbol: string) {
        return this.enumMembers.getSymbol(_symbol);
    }
}

Scope.registerScope(Keywords.Enum, EnumScope);
