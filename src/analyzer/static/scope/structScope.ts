import type {FieldSymbol} from "../symbol/fieldSymbol";
import type {FunctionSymbol} from "../symbol/functionSymbol";
import type {GenericSymbol} from "../symbol/genericSymbol";
import type {MetaSymbol} from "../symbol/metaSymbol";
import {checkSymbolOrSymbolArray, type Symbol, SymbolTable, TSymbolOrSymbolArray} from "../symbol/symbol";
import {Scope} from "./scope";
import {Keywords, ScopeKeywords} from "../../../types/keywords";

export class StructScope extends Scope {
    public readonly type: string = ScopeKeywords.StructScope;

    protected readonly generics: SymbolTable<GenericSymbol> = new SymbolTable<GenericSymbol>();
    protected readonly fields: SymbolTable<FieldSymbol> = new SymbolTable<FieldSymbol>();
    protected readonly methods: SymbolTable<FunctionSymbol> = new SymbolTable<FunctionSymbol>();
    protected readonly metaFunctions: SymbolTable<MetaSymbol> = new SymbolTable<MetaSymbol>();
    protected symbolTableList: SymbolTable<Symbol>[] = [this.generics, this.fields, this.methods];

    public get genericSymbols() {
        return this.generics.getAllSymbols();
    }

    public addGeneric(generic: TSymbolOrSymbolArray<GenericSymbol>): boolean {
        const success = this.checkSymbolUnique(generic) && this.generics.addSymbol(generic);
        return success;
    }

    public addField(field: TSymbolOrSymbolArray<FieldSymbol>): boolean {
        const success = this.checkSymbolUnique(field) && this.fields.addSymbol(field);
        return success;
    }

    public addMethod(method: TSymbolOrSymbolArray<FunctionSymbol>): boolean {
        return checkSymbolOrSymbolArray(method, (method) => {
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

    public addMetaFunction(metaFunction: TSymbolOrSymbolArray<MetaSymbol>): boolean {
        return checkSymbolOrSymbolArray(metaFunction, (metaFunction) => {
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
        const symbol = this.fields.getSymbol(name) || this.methods.getSymbol(name) || this.generics.getSymbol(name);
        return symbol;
    }
}

Scope.registerScope(Keywords.Struct, StructScope);
