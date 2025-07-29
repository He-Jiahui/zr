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
import {IntermediateSymbol} from "../symbol/intermediateSymbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {ZrIntermediateWritable} from "../../../generator/writable/writable";
import {
    ZrIntermediateDeclare,
    ZrIntermediateDeclareType,
    ZrIntermediateModule
} from "../../../generator/writable/module";
import type {ModuleSymbol} from "../symbol/moduleSymbol";

export class ModuleScope extends Scope {
    public readonly type: string = ScopeKeywords.ModuleScope;

    protected readonly functions: SymbolTable<FunctionSymbol> = new SymbolTable();
    protected readonly intermediate: SymbolTable<IntermediateSymbol> = new SymbolTable();
    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly classes: SymbolTable<ClassSymbol> = new SymbolTable();
    protected readonly interfaces: SymbolTable<InterfaceSymbol> = new SymbolTable();
    protected readonly structs: SymbolTable<StructSymbol> = new SymbolTable();
    protected readonly enums: SymbolTable<EnumSymbol> = new SymbolTable();
    protected readonly tests: SymbolTable<TestSymbol> = new SymbolTable();

    protected symbolTableList: SymbolTable<Symbol>[] = [this.functions, this.intermediate, this.variables, this.classes, this.interfaces, this.structs, this.enums, this.tests];

    public addFunction($function: TSymbolOrSymbolArray<FunctionSymbol>): boolean {
        const success = this.checkSymbolUnique($function) && this.functions.addSymbol($function);
        return success;
    }

    public addIntermediate(intermediate: TSymbolOrSymbolArray<IntermediateSymbol>): boolean {
        const success = this.checkSymbolUnique(intermediate) && this.intermediate.addSymbol(intermediate);
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

    protected _toWritable(): TNullable<ZrIntermediateWritable> {
        const module = new ZrIntermediateModule();
        const owner = this.ownerSymbol as ModuleSymbol;
        module.name = owner.name || "";

        // todo: only intermediate supports now
        for (const intermediate of this.intermediate.getAllSymbols()) {
            const scope = intermediate.childScope;
            if (scope) {
                const declareData = new ZrIntermediateDeclare();
                declareData.type = ZrIntermediateDeclareType.Function;
                declareData.data = scope.toWritable();
                module.declares.push(declareData);
            }
        }

        return module;
    }
}

Scope.registerScope(Keywords.Module, ModuleScope);
