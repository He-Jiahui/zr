import type {ClassSymbol} from "../symbol/classSymbol";
import type {EnumSymbol} from "../symbol/enumSymbol";
import type {FunctionSymbol} from "../symbol/functionSymbol";
import type {InterfaceSymbol} from "../symbol/interfaceSymbol";
import type {StructSymbol} from "../symbol/structSymbol";
import {type Symbol, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import type {VariableSymbol} from "../symbol/variableSymbol";
import {Scope} from "./scope";
import {TestSymbol} from "../symbol/testSymbol";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class ModuleScope extends Scope {
    public readonly type: string = ScopeKeywords.ModuleScope;

    protected readonly functions: SymbolTable<FunctionSymbol> = new SymbolTable();
    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly classes: SymbolTable<ClassSymbol> = new SymbolTable();
    protected readonly interfaces: SymbolTable<InterfaceSymbol> = new SymbolTable();
    protected readonly structs: SymbolTable<StructSymbol> = new SymbolTable();
    protected readonly enums: SymbolTable<EnumSymbol> = new SymbolTable();
    protected readonly tests: SymbolTable<TestSymbol> = new SymbolTable();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.functions, this.variables, this.classes, this.interfaces, this.structs, this.enums, this.tests];

    public addFunction($function: TSymbolOrSymbolArray<FunctionSymbol>): boolean {
        const success = this.checkSymbolUnique($function) && this.functions.addSymbol($function);
        return success;
    }

    public addVariable(variable: TSymbolOrSymbolArray<VariableSymbol>): boolean {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    public addClass($class: TSymbolOrSymbolArray<ClassSymbol>): boolean {
        const success = this.checkSymbolUnique($class) && this.classes.addSymbol($class);
        return success;
    }

    public addInterface($interface: TSymbolOrSymbolArray<InterfaceSymbol>): boolean {
        const success = this.checkSymbolUnique($interface) && this.interfaces.addSymbol($interface);
        return success;
    }

    public addStruct($struct: TSymbolOrSymbolArray<StructSymbol>): boolean {
        const success = this.checkSymbolUnique($struct) && this.structs.addSymbol($struct);
        return success;
    }

    public addEnum($enum: TSymbolOrSymbolArray<EnumSymbol>): boolean {
        const success = this.checkSymbolUnique($enum) && this.enums.addSymbol($enum);
        return success;
    }

    public addTest($test: TSymbolOrSymbolArray<TestSymbol>): boolean {
        const success = this.checkSymbolUnique($test) && this.tests.addSymbol($test);
        return success;
    }

    protected _getSymbol(name: string) {
        const symbol = this.variables.getSymbol(name) || this.functions.getSymbol(name) || this.classes.getSymbol(name) || this.interfaces.getSymbol(name) || this.structs.getSymbol(name) || this.enums.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope(Keywords.Module, ModuleScope);
