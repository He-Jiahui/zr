import type {BooleanType} from "./booleanHandler";
import type {StringType} from "./stringHandler";
import type {CharType} from "./charHandler";
import type {FloatType} from "./floatHandler";
import type {IntegerType} from "./integerHandler";
import type {NullType} from "./nullHandler";

export type LiteralType = BooleanType |
    StringType |
    CharType |
    FloatType |
    IntegerType |
    NullType;
