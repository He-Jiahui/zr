import {Symbol, SymbolTable} from "../analyzer/static/symbol/symbol";
import {Logger} from "./logger";
import {Scope} from "../analyzer/static/scope/scope";

const indentCounter: Map<number, string> = new Map();

export function prettyPrintSymbolTables(sym: Symbol, indent: number = 0) {
    // create indent
    let indentString = "";
    if (indentCounter.has(indent)) {
        indentString = indentCounter.get(indent)!;
    } else {
        indentString = " ".repeat(indent);
        indentCounter.set(indent, indentString);
    }
    const text = `- ${sym.name} : ${sym.type}`;
    Logger.info(`${indentString}${text}`);
    for (const key of Object.keys(sym)) {
        const value = (sym as any)[key];
        if (value instanceof Scope && key !== "ownerScope") {
            for (const key2 of (value as any).symbolTableList) {
                if (key2 instanceof SymbolTable) {
                    for (const sym of (key2 as any).symbolTable) {
                        prettyPrintSymbolTables(sym, indent + 2);
                    }
                } else if (typeof (key2) === "function") {
                    const k = key2() as Symbol | null;
                    if (!k) {
                        continue;
                    }
                    prettyPrintSymbolTables(k, indent + 2);
                }
            }
        }
    }
}