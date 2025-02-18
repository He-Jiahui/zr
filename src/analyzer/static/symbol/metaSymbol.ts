import { MetaType } from '../../semantic/declarations/metaHandler';
import { FunctionSymbol } from './functionSymbol';

export class MetaSymbol extends FunctionSymbol {
    public readonly type: string = "meta";

    public metaType: MetaType;

    
}