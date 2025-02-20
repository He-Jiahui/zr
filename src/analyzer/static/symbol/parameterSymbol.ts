
import { VariableSymbol } from "./variableSymbol";
import { Symbol } from './symbol';

export class ParameterSymbol extends VariableSymbol {
    public readonly type:string = "parameter";

}
Symbol.registerSymbol("Parameter", ParameterSymbol);
