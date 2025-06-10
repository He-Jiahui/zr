import {Scope} from "./scope";
import {TNullable} from "../../utils/zrCompilerTypes";
import {BlockSymbol} from "../symbol/blockSymbol";
import {SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {ParameterSymbol} from "../symbol/parameterSymbol";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class TestScope extends Scope {
    public readonly type: string = ScopeKeywords.TestScope;

    public body: TNullable<BlockSymbol> = null;
    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected symbolTableList = [this.parameters, () => this.body];

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

Scope.registerScope(Keywords.Test, TestScope);
