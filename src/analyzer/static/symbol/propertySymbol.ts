import type {PropertyType} from '../../../types/access';
import {FieldSymbol} from './fieldSymbol';
import {Symbol} from './symbol';

export class PropertySymbol extends FieldSymbol {
    public readonly type: string = 'property';

    public propertyType: PropertyType;

}

Symbol.registerSymbol("Property", PropertySymbol);
