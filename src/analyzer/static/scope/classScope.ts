import {PropertyType} from "../../../types/access";
import type {ClassSymbol} from "../symbol/classSymbol";
import type {FieldSymbol} from "../symbol/fieldSymbol";
import type {FunctionSymbol} from "../symbol/functionSymbol";
import type {GenericSymbol} from "../symbol/genericSymbol";
import type {MetaSymbol} from "../symbol/metaSymbol";
import type {PropertySymbol} from "../symbol/propertySymbol";
import {checkSymbolOrSymbolSet, type Symbol, SymbolTable, TSymbolOrSymbolSet} from "../symbol/symbol";
import {Scope} from "./scope";

export class ClassScope extends Scope {
    public readonly type: string = "ClassScope";

    public classInfo: ClassSymbol;

    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly fields: SymbolTable<FieldSymbol> = new SymbolTable<FieldSymbol>();
    protected readonly properties: SymbolTable<PropertySymbol> = new SymbolTable<PropertySymbol>();
    protected readonly methods: SymbolTable<FunctionSymbol> = new SymbolTable<FunctionSymbol>();
    protected readonly metaFunctions: SymbolTable<MetaSymbol> = new SymbolTable<MetaSymbol>();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.generics, this.fields, this.properties, this.methods, this.metaFunctions];

    public addGeneric(generic: TSymbolOrSymbolSet<GenericSymbol>): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addField(field: TSymbolOrSymbolSet<FieldSymbol>): boolean {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }

    public addProperty(property: TSymbolOrSymbolSet<PropertySymbol>): boolean {
        return checkSymbolOrSymbolSet(property, (property) => {
            const definedProperty = this.properties.getSymbol(property.name);
            if (definedProperty) {
                // check type of defined property
                if (definedProperty.propertyType === property.propertyType || definedProperty.propertyType === PropertyType.GET_SET) {
                    // TODO: throw error if they are the same type or if they are GET_SET
                    return false;
                }
                if (definedProperty.isStatic !== property.isStatic) {
                    // TODO: throw error if they are not the same type
                    return false;
                }
                // warning if they have different accessibility
                if (definedProperty.accessibility !== property.accessibility) {
                    // TODO: throw warning if they have different accessibility
                }

                // merge getter and setter body if they are not defined yet
                definedProperty.propertyType = PropertyType.GET_SET;
                definedProperty.getterSymbol = property.getterSymbol ?? definedProperty.getterSymbol;
                definedProperty.setterSymbol = property.setterSymbol ?? definedProperty.setterSymbol;

            }
            const success = this.checkSymbolUnique(property) && this.properties.addSymbol(property);
            return success;
        });
    }

    public addMethod(method: TSymbolOrSymbolSet<FunctionSymbol>): boolean {
        return checkSymbolOrSymbolSet(method, (method) => {
            if (method) {
                const definedMethod = this.methods.getSymbol(method.name);
                if (definedMethod) {
                    // now we are not able to check overloads signatures, just add into overload list
                    // it will be checked later when type is resolved
                    definedMethod.overloads.push(method);
                    return true;
                }
            }
            const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
            return success;
        });
    }

    public addMetaFunction(metaFunction: TSymbolOrSymbolSet<MetaSymbol>): boolean {
        return checkSymbolOrSymbolSet(metaFunction, (metaFunction) => {
            if (metaFunction) {
                const definedMetaFunction = this.metaFunctions.getSymbol(metaFunction.name);
                if (definedMetaFunction) {
                    definedMetaFunction.overloads.push(metaFunction);
                    return true;
                }
            }
            const success = this.metaFunctions.addSymbol(metaFunction);
            return success;
        });
    }

    protected _getSymbol(name: string) {
        const symbol = this.fields.getSymbol(name) || this.properties.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope("Class", ClassScope);
