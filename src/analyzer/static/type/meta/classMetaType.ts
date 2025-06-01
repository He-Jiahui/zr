import {MetaType} from "./metaType";
import type {ClassSymbol} from "../../symbol/classSymbol";

export class ClassMetaType extends MetaType<ClassSymbol> {
    protected _onTypeCreated(symbol: ClassSymbol) {

    }
}

MetaType.registerType("class", ClassMetaType);
