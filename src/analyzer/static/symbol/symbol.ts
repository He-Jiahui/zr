import { ZrError } from "../../../errors/zrError";
import { ZrInternalError } from "../../../errors/zrInternalError";
import { FileRange } from "../../../parser/generated/parser";
import type { Scope } from "../scope/scope";

export class Symbol{
    private static readonly symbolMap: Map<string, typeof Symbol> = new Map<string, typeof Symbol>();
    
    public static registerSymbol(symbolType: string, symbol:typeof Symbol){
        Symbol.symbolMap.set(symbolType, symbol);
    }

    public static createSymbol<T extends Symbol>(symbolType: string, name: string): T{
        const symbol = Symbol.symbolMap.get(symbolType);
        if(!symbol){
            return null!;
        }
        return new symbol(name) as T;
    }

    public readonly type: string;
    public name: string;
    public ownerScope: Scope; // TODO: owner scope
    public location?: FileRange;

    constructor(name: string){
        this.name = name;
    }
}

export class SymbolTable<T extends Symbol>{
    private readonly symbolTable: T[] = [];

    public location: FileRange;
    constructor(){
        
    }

    public addSymbol(symbol: T): boolean{
        const duplicatedCheckIndex = this.symbolTable.findIndex(s => s.name === symbol.name);
        if(duplicatedCheckIndex === -1){
            this.symbolTable.push(symbol);
            return true;
        }else{
            // TODO: throw error
        }
        return false;
    }

    public getSymbol(name: string){
        // todo:
        return this.symbolTable.find(s => s.name === name);
    }
}