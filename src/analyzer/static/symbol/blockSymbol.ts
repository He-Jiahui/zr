import {Symbol} from "./symbol";
import {TypeReference} from "../type/typeReference";
import {Keywords} from "../../../types/keywords";

export class BlockSymbol extends Symbol {
    public readonly type: string = Keywords.Block;
    // 函数可能的返回值
    public returnType: TypeReference;
}

Symbol.registerSymbol(Keywords.Block, BlockSymbol);
