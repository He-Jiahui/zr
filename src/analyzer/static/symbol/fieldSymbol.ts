import type { Access } from "../../../types/access";
import { VariableSymbol } from "./variableSymbol";
import { Symbol } from "./symbol";

export class FieldSymbol extends VariableSymbol{
    public readonly type:string = "field";

    public accessibility: Access;
    public isStatic: boolean;
    // 函数装饰器
    public readonly decorators: any[] = [];

}

Symbol.registerSymbol("Field", FieldSymbol);
