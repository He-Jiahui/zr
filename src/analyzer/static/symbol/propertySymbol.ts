import type { PropertyType } from '../../../types/access';
import { FieldSymbol } from './fieldSymbol';
import type { FunctionSymbol } from './functionSymbol';
import { Symbol } from './symbol';
export class PropertySymbol extends FieldSymbol {
    public readonly type:string = 'property';
    
    public propertyType: PropertyType;

    public getterSymbol: FunctionSymbol;
    public setterSymbol: FunctionSymbol;

}

Symbol.registerSymbol("Property", PropertySymbol);
