import { FunctionSymbol } from './functionSymbol';
import { Symbol } from './symbol';

export class MetaSymbol extends FunctionSymbol {
    public readonly type: string = "meta";
    public override readonly overloads: MetaSymbol[] = [];
    public metaType: string;
}

Symbol.registerSymbol("Meta", MetaSymbol);
