import { FieldSymbol } from "./fieldSymbol";
import { Symbol } from "./symbol";
export class GenericSymbol extends FieldSymbol {
    public readonly type:string = 'generic';


}

Symbol.registerSymbol("Generic", GenericSymbol);
