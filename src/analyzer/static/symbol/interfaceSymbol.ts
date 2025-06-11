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
    public readonly interfaces: InterfaceMetaType[] = [];

    public readonly inheritsFrom: TypePlaceholder[] = [];

    public readonly decorators: any[] = [];

    public isSubClassOf(inheritSymbol: InterfaceSymbol) {
        if (inheritSymbol === this) {
            return true;
        }
        for (const $interface of this.interfaces) {
            if ($interface.relatedSymbol.isSubClassOf(inheritSymbol)) {
                return true;
            }
        }
        return false;
    }
}

Symbol.registerSymbol(Keywords.Interface, InterfaceSymbol);
