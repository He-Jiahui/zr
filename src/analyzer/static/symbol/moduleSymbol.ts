import type { ModuleScope } from '../scope/moduleScope';
import { Symbol } from './symbol';

export class ModuleSymbol extends Symbol {
    public readonly type: string = "module";


    public table: ModuleScope;

}

Symbol.registerSymbol("Module", ModuleSymbol);
