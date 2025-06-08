import type {InterfaceSymbol} from "../../symbol/interfaceSymbol";
import {MetaType} from "./metaType";
import {Keywords} from "../../../../types/keywords";

export class InterfaceMetaType extends MetaType<InterfaceSymbol> {
    protected _onTypeCreated(symbol: InterfaceSymbol) {
        symbol.generatedType = this;
        if (symbol.childScope) {
            if (symbol.childScope.genericSymbols.length > 0) {
                this._isGeneric = true;
            }
        }
    }
}

MetaType.registerType(Keywords.Interface, InterfaceMetaType);
