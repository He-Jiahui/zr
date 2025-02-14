import { BlockScope } from "../scope/blockScope";
import { TypeReference } from "../type/type";
import { Symbol } from "./symbol";
import type { VariableSymbol } from "./variableSymbol";
export class FunctionSymbol extends Symbol {
    public readonly type:string="function";

    // 函数参数
    public params: VariableSymbol[] = [];
    // 函数返回值
    public returnType: TypeReference;
    // 函数体
    public body: BlockScope;
    // 函数调用
    public isStatic: boolean = false;
    // 函数装饰器
    public readonly decorators: any[] = [];
    
}