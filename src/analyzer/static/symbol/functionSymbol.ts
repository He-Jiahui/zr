
import type { FunctionScope } from "../scope/functionScope";
import type { TypeReference } from "../type/type";
import { Symbol } from "./symbol";
export class FunctionSymbol extends Symbol {
    public readonly type:string="function";

    // 函数返回值
    public returnType: TypeReference;
    // 函数体
    public body: FunctionScope;
    // 函数调用
    public isStatic: boolean = false;
    // 函数装饰器
    public readonly decorators: any[] = [];
    
}

Symbol.registerSymbol("Function", FunctionSymbol);
