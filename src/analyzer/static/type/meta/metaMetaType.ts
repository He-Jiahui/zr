import {MetaType} from "./metaType";
import type {MetaSymbol} from "../../symbol/metaSymbol";
import {Keywords} from "../../../../types/keywords";

export class MetaMetaType extends MetaType<MetaSymbol> {
    protected _onTypeCreated(symbol: MetaSymbol) {
        symbol.generatedType = this;
    }
}

MetaType.registerType(Keywords.Meta, MetaMetaType);
