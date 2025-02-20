
import type { ClassSymbol } from "../symbol/classSymbol";
import type { EnumSymbol } from "../symbol/enumSymbol";
import type { FunctionSymbol } from "../symbol/functionSymbol";
import type { InterfaceSymbol } from "../symbol/interfaceSymbol";
import type { ModuleSymbol } from "../symbol/moduleSymbol";
import type { StructSymbol } from "../symbol/structSymbol";
import { type Symbol, SymbolTable } from "../symbol/symbol";
import type { VariableSymbol } from "../symbol/variableSymbol";
import { Scope } from "./scope";
export class ModuleScope extends Scope {
    public readonly type: string = "ModuleScope";

    public moduleInfo: ModuleSymbol;
    
    protected readonly functions: SymbolTable<FunctionSymbol> = new SymbolTable();
    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly classes: SymbolTable<ClassSymbol> = new SymbolTable();
    protected readonly interfaces: SymbolTable<InterfaceSymbol> = new SymbolTable();
    protected readonly structs: SymbolTable<StructSymbol> = new SymbolTable();
    protected readonly enums: SymbolTable<EnumSymbol> = new SymbolTable();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.functions, this.variables, this.classes, this.interfaces, this.structs, this.enums];

    public addFunction($function: FunctionSymbol): boolean {
        const success = this.checkSymbolUnique($function) && this.functions.addSymbol($function);
        return success;
    }

    public addVariable(variable: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(variable) && this.variables.addSymbol(variable);
        return success;
    }

    public addClass($class: ClassSymbol): boolean {
        const success = this.checkSymbolUnique($class) && this.classes.addSymbol($class);
        return success;
    }

    public addInterface($interface: InterfaceSymbol): boolean {
        const success = this.checkSymbolUnique($interface) && this.interfaces.addSymbol($interface);
        return success;
    }

    public addStruct($struct: StructSymbol): boolean {
        const success = this.checkSymbolUnique($struct) && this.structs.addSymbol($struct);
        return success;
    }

    public addEnum($enum: EnumSymbol): boolean {
        const success = this.checkSymbolUnique($enum) && this.enums.addSymbol($enum);
        return success;
    }

    protected _getSymbol(name: string) {
        const symbol = this.variables.getSymbol(name) || this.functions.getSymbol(name) || this.classes.getSymbol(name) || this.interfaces.getSymbol(name) || this.structs.getSymbol(name) || this.enums.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope("Module", ModuleScope);