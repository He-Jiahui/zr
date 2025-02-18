import { ClassSymbol } from "../symbol/classSymbol";
import { FieldSymbol } from "../symbol/fieldSymbol";
import { FunctionSymbol } from "../symbol/functionSymbol";
import { GenericSymbol } from "../symbol/genericSymbol";
import { MetaSymbol } from "../symbol/metaSymbol";
import { PropertySymbol } from "../symbol/propertySymbol";
import { Symbol, SymbolTable } from "../symbol/symbol";
import { Scope } from "./scope";
export class ClassScope extends Scope {
    public readonly type: string = "ClassScope";

    public classInfo: ClassSymbol;
    
    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly fields: SymbolTable<FieldSymbol> = new SymbolTable<FieldSymbol>();
    protected readonly properties: SymbolTable<PropertySymbol> = new SymbolTable<PropertySymbol>();
    protected readonly methods: SymbolTable<FunctionSymbol> = new SymbolTable<FunctionSymbol>();
    protected readonly metaFunctions: SymbolTable<MetaSymbol> = new SymbolTable<MetaSymbol>();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.generics, this.fields, this.properties, this.methods];

    public addGeneric(generic: GenericSymbol): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addField(field: FieldSymbol): boolean {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }

    public addProperty(property: PropertySymbol): boolean {
        const success = this.checkSymbolUnique(property) && this.properties.addSymbol(property);
        return success;
    }

    public addMethod(method: FunctionSymbol): boolean {
        const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
        return success;
    }

    public addMetaFunction(metaFunction: MetaSymbol): boolean {
        const success = this.metaFunctions.addSymbol(metaFunction);
        return success;
    }

    protected _getSymbol(name: string) {
        const symbol = this.fields.getSymbol(name) || this.properties.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}