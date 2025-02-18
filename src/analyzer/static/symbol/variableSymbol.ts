import type { TypeReference } from "../type/type";
import { Symbol } from "./symbol";

export class VariableSymbol extends Symbol {
    public readonly type:string = "variable";
    public typeRef: TypeReference;
    public defaultValue: any;//TODO: type
}