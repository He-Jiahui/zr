
import type { InterfaceScope } from '../scope/interfaceScope';
import { Symbol } from './symbol';

export class InterfaceSymbol extends Symbol {
    public readonly type: string = "interface";

    public interfaces: InterfaceSymbol[] = [];

    public table: InterfaceScope;

    public readonly decorators: any[] = [];
}

Symbol.registerSymbol("Interface", InterfaceSymbol);
