
import type { FieldSymbol } from "../symbol/fieldSymbol";
import type { FunctionSymbol } from "../symbol/functionSymbol";
import type { GenericSymbol } from "../symbol/genericSymbol";
import type { MetaSymbol } from "../symbol/metaSymbol";
import type { StructSymbol } from "../symbol/structSymbol";
import { type Symbol, SymbolTable } from "../symbol/symbol";
import { Scope } from "./scope";
export class StructScope extends Scope {
    public readonly type: string = "StructScope";

    public structInfo: StructSymbol;
    
    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly fields: SymbolTable<FieldSymbol> = new SymbolTable<FieldSymbol>();
    protected readonly methods: SymbolTable<FunctionSymbol> = new SymbolTable<FunctionSymbol>();
    protected readonly metaFunctions: SymbolTable<MetaSymbol> = new SymbolTable<MetaSymbol>();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.generics, this.fields, this.methods];

    public addGeneric(generic: GenericSymbol | undefined): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addField(field: FieldSymbol | undefined): boolean {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }

    public addMethod(method: FunctionSymbol | undefined): boolean {
        const success = this.checkSymbolUnique(method) && this.methods.addSymbol(method);
        return success;
    }

    public addMetaFunction(metaFunction: MetaSymbol | undefined): boolean {
        const success = this.metaFunctions.addSymbol(metaFunction);
        return success;
    }

    protected _getSymbol(name: string) {
        const symbol = this.fields.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope("Struct", StructScope);