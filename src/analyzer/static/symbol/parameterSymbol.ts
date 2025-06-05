import {VariableSymbol} from "./variableSymbol";
import {Symbol} from './symbol';
import {Keywords} from "../../../types/keywords";

export class ParameterSymbol extends VariableSymbol {
    public readonly type: string = Keywords.Parameter;

}

Symbol.registerSymbol(Keywords.Parameter, ParameterSymbol);
