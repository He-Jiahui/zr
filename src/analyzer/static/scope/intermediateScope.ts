import {Scope} from "./scope";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

import {SymbolTable} from "../symbol/symbol";
import type {ParameterSymbol} from "../symbol/parameterSymbol";
import {VariableSymbol} from "../symbol/variableSymbol";
import {ZrIntermediateWritable} from "../../../generator/writable/writable";
import {TNullable} from "../../utils/zrCompilerTypes";
import {ZrIntermediateFunction} from "../../../generator/writable/function";
import type {IntermediateSymbol} from "../symbol/intermediateSymbol";

export class IntermediateScope extends Scope {
    public readonly type = ScopeKeywords.IntermediateScope;

    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected readonly locals: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly variables: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly closures: SymbolTable<VariableSymbol> = new SymbolTable();
    protected readonly constants: SymbolTable<VariableSymbol> = new SymbolTable();
    protected symbolTableList = [this.parameters, this.locals, this.variables, this.closures, this.constants];

    public addParameter(parameterSymbol: ParameterSymbol): boolean {
        const success = this.checkSymbolUnique(parameterSymbol) && this.parameters.addSymbol(parameterSymbol);
        return success;
    }

    public addLocal(localSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(localSymbol) && this.locals.addSymbol(localSymbol);
        return success;
    }

    public addConstant(constantSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(constantSymbol) && this.constants.addSymbol(constantSymbol);
        return success;
    }

    public addVariable(variableSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(variableSymbol) && this.variables.addSymbol(variableSymbol);
        return success;
    }

    public addClosure(closureSymbol: VariableSymbol): boolean {
        const success = this.checkSymbolUnique(closureSymbol) && this.closures.addSymbol(closureSymbol);
        return success;
    }


    protected _toWritable(): TNullable<ZrIntermediateWritable> {

        const writable = new ZrIntermediateFunction();
        const owner = this.ownerSymbol as IntermediateSymbol;
        const handler = owner.handler!;

        writable.name = owner.name || "";
        writable.startLine = owner.location!.start.line;
        writable.endLine = owner.location!.end.line;
        writable.parameterLength = this.parameters.getAllSymbols().length;
        // todo:
        writable.hasVarArgs = 0;
        // todo
        return writable;
    }
}

Scope.registerScope(Keywords.Intermediate, IntermediateScope);
