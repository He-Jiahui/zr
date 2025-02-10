import "./booleanHandler";
import "./stringHandler";
import "./charHandler";
import "./floatHandler";
import "./integerHandler";
import "./nullHandler";
import { BooleanType } from "./booleanHandler";
import { StringType } from "./stringHandler";
import { CharType } from "./charHandler";
import { FloatType } from "./floatHandler";
import { IntegerType } from "./integerHandler";
import { NullType } from "./nullHandler";

export type LiteralType = BooleanType |
StringType |
CharType | 
FloatType | 
IntegerType | 
NullType;