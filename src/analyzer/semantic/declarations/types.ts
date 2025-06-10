import type {ClassType} from "./class/classHandler";
import type {StructType} from "./struct/structHandler";
import type {InterfaceType} from "./interface/interfaceHandler";
import type {EnumType} from "./enum/enumHandler";
import type {VariableType} from "./variable/variableHandler";
import type {FunctionType} from "./function/functionHandler";

export type DeclarationType = ClassType
    | StructType
    | InterfaceType
    | EnumType
    | VariableType
    | FunctionType;
