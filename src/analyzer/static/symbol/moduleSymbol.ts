import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class ModuleSymbol extends Symbol {
    public readonly type: string = Keywords.Module;
}

Symbol.registerSymbol(Keywords.Module, ModuleSymbol);
