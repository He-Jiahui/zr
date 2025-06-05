import {MetaType} from "./metaType";
import type {ClassSymbol} from "../../symbol/classSymbol";
import {Keywords} from "../../../../types/keywords";

export class ClassMetaType extends MetaType<ClassSymbol> {
    protected _onTypeCreated(symbol: ClassSymbol) {

    }
}

MetaType.registerType(Keywords.Class, ClassMetaType);
