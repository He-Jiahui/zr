import {TSymbolOrSymbolArray} from "../symbol/symbol";
import {Scope} from "./scope";
import {TNullable} from "../../utils/zrCompilerTypes";
import type {FunctionSymbol} from "../symbol/functionSymbol";

export class PropertyScope extends Scope {
    public readonly type: string = "PropertyScope";

    public getterSymbol: TNullable<FunctionSymbol>;
    public setterSymbol: TNullable<FunctionSymbol>;
    protected symbolTableList = [() => this.getterSymbol, () => this.setterSymbol];


    public setGetter(getter: TSymbolOrSymbolArray<FunctionSymbol>) {
        if (getter instanceof Array) {
            this.getterSymbol = getter[0];
        } else {
            this.getterSymbol = getter ?? null;
        }
    }

    public setSetter(setter: TSymbolOrSymbolArray<FunctionSymbol>) {
        if (setter instanceof Array) {
            this.setterSymbol = setter[0];
        } else {
            this.setterSymbol = setter ?? null;
        }
    }


    protected _getSymbol(_symbol: string) {
        return (_symbol === "getter" ? this.getterSymbol : this.setterSymbol) ?? null;
    }

}

Scope.registerScope("Property", PropertyScope);
