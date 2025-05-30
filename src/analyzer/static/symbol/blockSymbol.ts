import {Symbol} from "./symbol";
import {TypeReference} from "../type/typeReference";

export class BlockSymbol extends Symbol {
    public readonly type: string = "block";
    // 函数可能的返回值
    public returnType: TypeReference;
}

Symbol.registerSymbol("Block", BlockSymbol);
