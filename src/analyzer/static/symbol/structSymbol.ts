import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";
import type {StructMetaType} from "../type/meta/structMetaType";
import {TNullable} from "../../utils/zrCompilerTypes";
import type {StructScope} from "../scope/structScope";
import {TypePlaceholder} from "../type/typePlaceholder";

export class StructSymbol extends Symbol {
    public readonly type: string = Keywords.Struct;
    public childScope: TNullable<StructScope>;
    public generatedType: StructMetaType;

    public readonly inheritsFrom: TypePlaceholder[] = [];
}

Symbol.registerSymbol(Keywords.Struct, StructSymbol);
