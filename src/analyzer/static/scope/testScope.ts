import {Scope} from "./scope";
import {TNullable} from "../../utils/zrCompilerTypes";
import {BlockSymbol} from "../symbol/blockSymbol";
import {type Symbol, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {ParameterSymbol} from "../symbol/parameterSymbol";

export class TestScope extends Scope {
    public readonly type: string = "TestScope";

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

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return this.parameters.getSymbol(_symbol);
    }
}

Scope.registerScope("Test", TestScope)
