import type {Access} from "../../../types/access";
import {VariableSymbol} from "./variableSymbol";
import {Symbol} from "./symbol";
import {Keywords} from "../../../types/keywords";

export class FieldSymbol extends VariableSymbol {
    public readonly type: string = Keywords.Field;

    public accessibility: Access;
    public isStatic: boolean;
    // 函数装饰器
    public readonly decorators: any[] = [];

}

Symbol.registerSymbol(Keywords.Field, FieldSymbol);
