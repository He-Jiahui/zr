import type {InterfaceSymbol} from './interfaceSymbol';
import {Symbol} from './symbol';
import type {ClassMetaType} from "../type/meta/classMetaType";
import {Keywords} from "../../../types/keywords";
import {TNullable} from "../../utils/zrCompilerTypes";
import type {ClassScope} from "../scope/classScope";
import {TypePlaceholder} from "../type/typePlaceholder";
import type {InterfaceMetaType} from "../type/meta/interfaceMetaType";

export class ClassSymbol extends Symbol {
    public readonly type: string = Keywords.Class;

    public childScope: TNullable<ClassScope>;

    public readonly inheritsFrom: TypePlaceholder[] = [];

    public baseClass: TNullable<ClassMetaType> = null;
    public readonly interfaces: InterfaceMetaType[] = [];

    public readonly decorators: any[] = [];

    public generatedType: ClassMetaType;

    public isSubClassOf(inheritSymbol: ClassSymbol | InterfaceSymbol) {
        if (inheritSymbol === this) {
            return true;
        }
        if (this.baseClass) {
            if (this.baseClass.relatedSymbol.isSubClassOf(inheritSymbol)) {
                return true;
            }
        }
        if (inheritSymbol.type === Keywords.Interface) {
            for (const $interface of this.interfaces) {
                if ($interface.relatedSymbol.isSubClassOf(inheritSymbol as InterfaceSymbol)) {
                    return true;
                }
            }
        }

        return false;
    }
}

Symbol.registerSymbol(Keywords.Class, ClassSymbol);
