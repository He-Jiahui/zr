import type { ArrayType } from "./arrayHandler";
import type { GenericType } from "./genericHandler";
import type { TupleType } from "./tupleHandler";
import type { TypeType } from "./typeHandler";

export type Type = TypeType | GenericType |  TupleType | ArrayType;
