import {MetaType} from "./metaType";
import type {StructSymbol} from "../../symbol/structSymbol";
import {Keywords} from "../../../../types/keywords";

export class StructMetaType extends MetaType<StructSymbol> {
    protected _onTypeCreated(symbol: StructSymbol) {
        symbol.generatedType = this;
        if (symbol.childScope) {
            if (symbol.childScope.genericSymbols.length > 0) {
                this._isGeneric = true;
            }
        }
    }
}

MetaType.registerType(Keywords.Struct, StructMetaType);
