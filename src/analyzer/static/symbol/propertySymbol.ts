import type {PropertyType} from '../../../types/access';
import {FieldSymbol} from './fieldSymbol';
import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class PropertySymbol extends FieldSymbol {
    public readonly type: string = Keywords.Property;

    public propertyType: PropertyType;

}

Symbol.registerSymbol(Keywords.Property, PropertySymbol);
