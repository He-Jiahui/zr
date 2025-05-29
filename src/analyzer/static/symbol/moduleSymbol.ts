import {Symbol} from './symbol';

export class ModuleSymbol extends Symbol {
    public readonly type: string = "module";
}

Symbol.registerSymbol("Module", ModuleSymbol);
