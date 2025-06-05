import type {InterfaceSymbol} from './interfaceSymbol';
import {Symbol} from './symbol';
import type {ClassMetaType} from "../type/meta/classMetaType";
import {Keywords} from "../../../types/keywords";

export class ClassSymbol extends Symbol {
    public readonly type: string = Keywords.Class;

    public superClass?: ClassSymbol;
    public interfaces: InterfaceSymbol[] = [];

    public readonly decorators: any[] = [];

    public generatedType: ClassMetaType;
}

Symbol.registerSymbol(Keywords.Class, ClassSymbol);
