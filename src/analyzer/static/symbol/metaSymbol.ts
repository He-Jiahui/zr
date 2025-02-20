import type { MetaType } from '../../semantic/declarations/metaHandler';
import type { FunctionScope } from '../scope/functionScope';
import { FunctionSymbol } from './functionSymbol';
import { Symbol } from './symbol';

export class MetaSymbol extends FunctionSymbol {
    public readonly type: string = "meta";

    public metaType: MetaType;

    public body: FunctionScope;
    
}

Symbol.registerSymbol("Meta", MetaSymbol);
