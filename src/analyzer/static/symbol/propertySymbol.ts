import type {PropertyType} from '../../../types/access';
import {FieldSymbol} from './fieldSymbol';
import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";
import {TypePlaceholder} from "../type/typePlaceholder";

export class PropertySymbol extends FieldSymbol {
    public readonly type: string = Keywords.Property;

    public propertyType: PropertyType;
    public returnType: TypePlaceholder;
}

Symbol.registerSymbol(Keywords.Property, PropertySymbol);
