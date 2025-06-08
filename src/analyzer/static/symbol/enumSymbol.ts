import type {AllType} from "../../semantic/types/types";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";
import type {EnumMetaType} from "../type/meta/enumMetaType";
import {TNullable} from "../../utils/zrCompilerTypes";
import type {EnumScope} from "../scope/enumScope";

export class EnumSymbol extends Symbol {
    public readonly type: string = Keywords.Enum;
    public superType: AllType;
    public childScope: TNullable<EnumScope>;
    public generatedType: EnumMetaType;
}

Symbol.registerSymbol(Keywords.Enum, EnumSymbol);
