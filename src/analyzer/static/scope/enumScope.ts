import type { EnumSymbol } from "../symbol/enumSymbol";
import { type Symbol, SymbolTable } from "../symbol/symbol";
import type { VariableSymbol } from "../symbol/variableSymbol";
import { Scope } from "./scope";

export class EnumScope extends Scope {
    public readonly type: string = "EnumScope";

    public enumInfo: EnumSymbol;
    // 枚举类型
    private readonly enumMembers: SymbolTable<VariableSymbol> = new SymbolTable<VariableSymbol>();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.enumMembers];


    public addMember(member: VariableSymbol | undefined): boolean {
        return this.checkSymbolUnique(member) && this.enumMembers.addSymbol(member);
    }

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.enumMembers.getSymbol(_symbol);
    }
}

Scope.registerScope("Enum", EnumScope);