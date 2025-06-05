import {FunctionSymbol} from './functionSymbol';
import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class MetaSymbol extends FunctionSymbol {
    public readonly type: string = Keywords.Meta;
    public override readonly overloads: MetaSymbol[] = [];
    public metaType: string;
}

Symbol.registerSymbol(Keywords.Meta, MetaSymbol);
