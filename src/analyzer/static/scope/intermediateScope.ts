import {Scope} from "./scope";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

import {SymbolTable} from "../symbol/symbol";
import type {ParameterSymbol} from "../symbol/parameterSymbol";
import {VariableSymbol} from "../symbol/variableSymbol";

export class IntermediateScope extends Scope {
    public readonly type = ScopeKeywords.IntermediateScope;
    public readonly localStartList: number[] = [];
    public readonly localEndList: number[] = [];
    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected readonly locals: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly closures: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly constants: SymbolTable<VariableSymbol> = new SymbolTable();
    protected symbolTableList = [this.parameters, this.locals, this.closures, this.constants];

    public addParameter(parameterSymbol: ParameterSymbol): boolean {
        const success = this.checkSymbolUnique(parameterSymbol) && this.parameters.addSymbol(parameterSymbol);
        if (success) {
            parameterSymbol.index = this.parameters.getAllSymbols().length - 1;
        }
        return success;
    }

    public getParameters() {
        return this.parameters.getAllSymbols();
    }

    public addLocal(localSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(localSymbol) && this.locals.addSymbol(localSymbol);
        if (success) {
            localSymbol.index = this.locals.getAllSymbols().length - 1;
        }
        return success;
    }

    public getLocals() {
        return this.locals.getAllSymbols();
    }

    public addConstant(constantSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(constantSymbol) && this.constants.addSymbol(constantSymbol);
        if (success) {
            constantSymbol.index = this.constants.getAllSymbols().length - 1;
        }
        return success;
    }

    public getConstants() {
        return this.constants.getAllSymbols();
    }

    public addClosure(closureSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(closureSymbol) && this.closures.addSymbol(closureSymbol);
        if (success) {
            closureSymbol.index = this.closures.getAllSymbols().length - 1;
        }
        return success;
    }

    public getClosures() {
        return this.closures.getAllSymbols();
    }
}

Scope.registerScope(Keywords.Intermediate, IntermediateScope);
