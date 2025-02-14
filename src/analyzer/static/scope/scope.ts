import type { Symbol } from "../symbol/symbol";

export class Scope{
    private static readonly scopeMap: Map<string, typeof Scope> = new Map<string, typeof Scope>();
    
    public static registerScope(scopeType: string, scope:typeof Scope){
        Scope.scopeMap.set(scopeType, scope);
    }

    public static createScope<T extends Scope>(scopeType: string, parent: Scope | null = null): T{
        const scope = Scope.scopeMap.get(scopeType);
        if(!scope){
            return null!;
        }
        return new scope(parent) as T;
    }


    public readonly type: string;
    protected readonly parent: Scope | null;
    protected ownerSymbol: Symbol | null = null;

    constructor(parent: Scope | null = null){
        this.parent = parent;
    }


}