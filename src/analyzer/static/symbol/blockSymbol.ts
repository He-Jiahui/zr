import {Symbol} from "./symbol";
import type {BlockScope} from "../scope/blockScope";
import {TypeReference} from "../type/type";

export class BlockSymbol extends Symbol {
    public body: BlockScope;

    // 函数可能的返回值
    public returnType: TypeReference;
}

Symbol.registerSymbol("Block", BlockSymbol);