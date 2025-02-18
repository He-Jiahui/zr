import { PropertyType } from '../../../types/access';
import { FunctionScope } from '../scope/functionScope';
import { FieldSymbol } from './fieldSymbol';

export class PropertySymbol extends FieldSymbol {
    public readonly type:string = 'property';
    
    public propertyType: PropertyType;

    public getterBody: FunctionScope;
    public setterBody: FunctionScope;

}