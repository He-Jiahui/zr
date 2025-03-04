import {reportDuplicatedSymbol, Symbol, SymbolTable} from "../symbol/symbol";

type SymbolGetter = () => Symbol | null;

export class Scope {
    private static readonly scopeMap: Map<string, typeof Scope> = new Map<string, typeof Scope>();

    public static registerScope(scopeType: string, scope: typeof Scope) {
        Scope.scopeMap.set(scopeType, scope);
    }

    public static createScope<T extends Scope>(scopeType: string, parent: Scope | null = null): T {
        const scope = Scope.scopeMap.get(scopeType);
        if (!scope) {
            return null!;
        }
        return new scope(parent) as T;
    }


    public readonly type: string;
    protected readonly parent: Scope | null; // 父作用域
    protected symbolTableList: (SymbolTable<Symbol> | SymbolGetter | null)[] = [];

    constructor(parent: Scope | null = null) {
        this.parent = parent;
    }

    // 
    // 定义一个公共方法 getSymbol，用于获取符号对象
    public getSymbol(symbol: string): Symbol | null {
        // 调用私有方法 _getSymbol，尝试获取符号对象
        const sym = this._getSymbol(symbol);
        // 如果获取到了符号对象，则直接返回该符号对象
        if (sym) {
            return sym;
        }
        // 如果当前对象没有父对象，则返回 null
        if (this.parent) {
            // 如果当前对象有父对象，则递归调用父对象的 getSymbol 方法，尝试从父对象中获取符号对象
            return this.parent.getSymbol(symbol);
        }
        // 如果当前对象及其父对象都没有找到符号对象，则返回 null
        return null;
    }

    protected checkSymbolUnique(symbol: Symbol | undefined): boolean {
        if (!symbol) {
            return false;
        }
        for (const table of this.symbolTableList) {
            if (!table) {
                continue;
            }
            if (table instanceof SymbolTable) {
                const mayDuplicated = table.getSymbol(symbol.name);
                if (mayDuplicated) {
                    reportDuplicatedSymbol(symbol, mayDuplicated);
                    return false;
                }
            } else if (typeof (table) === "function") {
                const realSymbol = table() as Symbol | null;
                if (!realSymbol) {
                    continue;
                }
                if (realSymbol.name === symbol.name) {
                    reportDuplicatedSymbol(realSymbol, symbol);
                    return false;
                }
            }
        }
        return true;
    }

    protected _getSymbol(_symbol: string): Symbol | undefined {
        return undefined;
    }


}