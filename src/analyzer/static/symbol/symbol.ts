import { FileRange } from "../../../parser/generated/parser";
import type { Scope } from "../scope/scope";

export class Symbol{
    public readonly type: string;
    public name: string;
    public ownerScope: Scope; // TODO: owner scope
    public location: FileRange;

    constructor(name: string){
        this.name = name;
    }
}

export class SymbolTable<T extends Symbol>{
    private readonly symbolTable: T[] = [];

    public location: FileRange;
    constructor(){
        
    }

    public addSymbol(symbol: T){
        const duplicatedCheckIndex = this.symbolTable.findIndex(s => s.name === symbol.name);
        if(duplicatedCheckIndex === -1){
            this.symbolTable.push(symbol);
        }else{
            // TODO: throw error
        }
    }

    public getSymbol(name: string){
        // todo:
        return this.symbolTable.find(s => s.name === name);
    }
}