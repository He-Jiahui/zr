import {reportDuplicatedSymbol, Symbol, SymbolOrSymbolArray, SymbolTable} from "../symbol/symbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {TypeDefinition} from "../type/typeDefinition";
import {PredefinedType} from "../type/predefined/predefinedType";

type SymbolGetter = () => Symbol | null;

export class Scope {
    private static readonly scopeMap: Map<string, typeof Scope> = new Map<string, typeof Scope>();
    public readonly type: string;
    protected readonly _parentScope: TNullable<Scope>; // 父作用域
    protected readonly _ownerSymbol: TNullable<Symbol>;
    protected symbolTableList: (SymbolTable<Symbol> | SymbolGetter | null)[] = [];

    constructor(parentScope: TNullable<Scope>, ownerSymbol: TNullable<Symbol>) {
        this._parentScope = parentScope;
        this._ownerSymbol = ownerSymbol;

    }

    //
    public get ownerSymbol(): TNullable<Symbol> {
        return this._ownerSymbol;
    }

    public static registerScope(scopeType: string, scope: typeof Scope) {
        Scope.scopeMap.set(scopeType, scope);
    }

    public static createScope<T extends Scope>(scopeType: string, parent: TNullable<Scope>, symbol: TNullable<Symbol>): TNullable<T> {
        const scope = Scope.scopeMap.get(scopeType);
        if (!scope) {
            return null;
        }
        return new scope(parent, symbol) as T;
    }

    // 定义一个公共方法 getSymbol，用于获取符号对象
    public getSymbol(symbol: string): Symbol | null {
        // 调用私有方法 _getSymbol，尝试获取符号对象
        const sym = this._getSymbol(symbol);
        // 如果获取到了符号对象，则直接返回该符号对象
        if (sym) {
            return sym;
        }
        // 如果当前对象没有父对象，则返回 null
        if (this._parentScope) {
            // 如果当前对象有父对象，则递归调用父对象的 getSymbol 方法，尝试从父对象中获取符号对象
            return this._parentScope.getSymbol(symbol);
        }
        // 如果当前对象及其父对象都没有找到符号对象，则返回 null
        return null;
    }

    public getType(typeName: string): TNullable<TypeDefinition> {
        let currentScope: TNullable<Scope> = this as Scope;
        while (currentScope) {
            const type = currentScope._getType(typeName);
            if (type) {
                return type;
            }
            currentScope = currentScope._parentScope;
        }
        return PredefinedType.getPredefinedType(typeName);
    }

    protected checkSymbolUnique(symbol: SymbolOrSymbolArray): boolean {
        if (!symbol) {
            return false;
        }
        let symbolSet: Symbol[];
        if (symbol instanceof Array) {
            symbolSet = symbol;
        } else {
            symbolSet = [symbol];
        }
        let allSymbolUnique = true;
        for (const symbol of symbolSet) {
            for (const table of this.symbolTableList) {
                if (!table) {
                    continue;
                }
                if (table instanceof SymbolTable) {
                    const mayDuplicated = table.getSymbol(symbol.name);
                    if (mayDuplicated) {
                        reportDuplicatedSymbol(symbol, mayDuplicated);
                        allSymbolUnique = false;
                    }
                } else if (typeof (table) === "function") {
                    const realSymbol = table() as Symbol | null;
                    if (!realSymbol) {
                        continue;
                    }
                    if (realSymbol.name === symbol.name) {
                        reportDuplicatedSymbol(realSymbol, symbol);
                        allSymbolUnique = false;
                    }
                }
            }
        }
        return allSymbolUnique;
    }

    protected _getSymbol(symbol: string): TNullable<Symbol> {
        return null;
    }

    protected _getType(type: string): TNullable<TypeDefinition> {
        return null;
    }


}
