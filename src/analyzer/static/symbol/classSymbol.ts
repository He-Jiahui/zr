import type {InterfaceSymbol} from './interfaceSymbol';
import {Symbol} from './symbol';

export class ClassSymbol extends Symbol {
    public readonly type: string = "class";

    public superClass?: ClassSymbol;
    public interfaces: InterfaceSymbol[] = [];

    public readonly decorators: any[] = [];
}

Symbol.registerSymbol("Class", ClassSymbol);
