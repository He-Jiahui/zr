import type { PropertyType } from '../../../types/access';
import type { FunctionScope } from '../scope/functionScope';
import { FieldSymbol } from './fieldSymbol';
import { Symbol } from './symbol';
export class PropertySymbol extends FieldSymbol {
    public readonly type:string = 'property';
    
    public propertyType: PropertyType;

    public getterBody: FunctionScope;
    public setterBody: FunctionScope;

}

Symbol.registerSymbol("Property", PropertySymbol);
