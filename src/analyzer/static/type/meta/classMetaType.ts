import {MetaType} from "./metaType";
import type {ClassSymbol} from "../../symbol/classSymbol";
import {Keywords} from "../../../../types/keywords";

export class ClassMetaType extends MetaType<ClassSymbol> {
    protected _onTypeCreated(symbol: ClassSymbol) {
        symbol.generatedType = this;
        if (symbol.childScope) {
            if (symbol.childScope.genericSymbols.length > 0) {
                this._isGeneric = true;
            }
        }
    }
}

MetaType.registerType(Keywords.Class, ClassMetaType);
