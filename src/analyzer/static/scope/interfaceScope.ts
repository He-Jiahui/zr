import type {FieldSymbol} from "../symbol/fieldSymbol";
import type {FunctionSymbol} from "../symbol/functionSymbol";
import type {GenericSymbol} from "../symbol/genericSymbol";
import type {PropertySymbol} from "../symbol/propertySymbol";
import {type Symbol, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {Scope} from "./scope";

export class InterfaceScope extends Scope {
    public readonly type: string = "InterfaceScope";

    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly fields: SymbolTable<FieldSymbol> = new SymbolTable<FieldSymbol>();
    protected readonly properties: SymbolTable<PropertySymbol> = new SymbolTable<PropertySymbol>();
    protected readonly methods: SymbolTable<FunctionSymbol> = new SymbolTable<FunctionSymbol>();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.generics, this.fields, this.properties, this.methods];

    public addGeneric(generic: TSymbolOrSymbolArray<GenericSymbol>): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addField(field: TSymbolOrSymbolArray<FieldSymbol>): boolean {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }

    public addProperty(property: TSymbolOrSymbolArray<PropertySymbol>): boolean {
        const success = this.checkSymbolUnique(property) && this.properties.addSymbol(property);
        return success;
    }

    public addMethod(method: TSymbolOrSymbolArray<FunctionSymbol>): boolean {
        const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
        return success;
    }

    protected _getSymbol(name: string) {
        const symbol = this.fields.getSymbol(name) || this.properties.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope("Interface", InterfaceScope);
