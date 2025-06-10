import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";
import type {InterfaceMetaType} from "../type/meta/interfaceMetaType";
import {TNullable} from "../../utils/zrCompilerTypes";
import type {InterfaceScope} from "../scope/interfaceScope";
import {TypePlaceholder} from "../type/typePlaceholder";

export class InterfaceSymbol extends Symbol {
    public readonly type: string = Keywords.Interface;

    public generatedType: InterfaceMetaType;
    public childScope: TNullable<InterfaceScope>;
    public interfaces: InterfaceSymbol[] = [];

    public readonly inheritsFrom: TypePlaceholder[] = [];

    public readonly decorators: any[] = [];

}

Symbol.registerSymbol(Keywords.Interface, InterfaceSymbol);
