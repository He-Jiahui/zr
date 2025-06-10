import {Scope} from "./scope";
import {TNullable} from "../../utils/zrCompilerTypes";
import {BlockSymbol} from "../symbol/blockSymbol";
import {SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {ParameterSymbol} from "../symbol/parameterSymbol";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class TryScope extends Scope {
    public readonly type: string = ScopeKeywords.TryScope;

    public body: TNullable<BlockSymbol> = null;
    public catchBody: TNullable<BlockSymbol> = null;
    public finallyBody: TNullable<BlockSymbol> = null;

    protected readonly parameters: SymbolTable<ParameterSymbol> = new SymbolTable();
    protected symbolTableList = [this.parameters, () => this.body, () => this.catchBody, () => this.finallyBody];

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

    public setCatchBody(body: TSymbolOrSymbolArray<BlockSymbol>): void {
        if (body instanceof Array) {
            this.catchBody = body[0];
        } else {
            this.catchBody = body ?? null;
        }
    }

    public setFinallyBody(body: TSymbolOrSymbolArray<BlockSymbol>): void {
        if (body instanceof Array) {
            this.finallyBody = body[0];
        } else {
            this.finallyBody = body ?? null;
        }
    }

    protected _getSymbol(_symbol: string) {
        return this.parameters.getSymbol(_symbol);
    }
}

Scope.registerScope(Keywords.Try, TryScope);
