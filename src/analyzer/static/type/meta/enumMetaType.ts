import {MetaType} from "./metaType";
import type {EnumSymbol} from "../../symbol/enumSymbol";
import {Keywords} from "../../../../types/keywords";

export class EnumMetaType extends MetaType<EnumSymbol> {
    protected _onTypeCreated(symbol: EnumSymbol) {
        symbol.generatedType = this;
    }
}

MetaType.registerType(Keywords.Enum, EnumMetaType);
