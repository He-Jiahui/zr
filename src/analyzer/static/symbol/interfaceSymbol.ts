import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class InterfaceSymbol extends Symbol {
    public readonly type: string = Keywords.Interface;

    public interfaces: InterfaceSymbol[] = [];

    public readonly decorators: any[] = [];

}

Symbol.registerSymbol(Keywords.Interface, InterfaceSymbol);
