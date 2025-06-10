import {MetaType} from "./metaType";
import type {FunctionSymbol} from "../../symbol/functionSymbol";
import {Keywords} from "../../../../types/keywords";

export class FunctionMetaType extends MetaType<FunctionSymbol> {
    protected _onTypeCreated(symbol: FunctionSymbol) {
        symbol.generatedType = this;
    }
}

MetaType.registerType(Keywords.Function, FunctionMetaType);
