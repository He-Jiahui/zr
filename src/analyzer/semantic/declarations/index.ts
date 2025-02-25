import "./identifierHandler";
import "./metaHandler";
import "./struct/index";
import "./class/index";
import "./interface/index";
import "./enum/index";
import "./variable/index";
import "./function/index";
import { ClassType } from "./class/classHandler";
import { StructType } from "./struct/structHandler";
import { InterfaceType } from "./interface/interfaceHandler";
import { EnumType } from "./enum/enumHandler";
import { VariableType } from "./variable/variableHandler";
import { FunctionType } from "./function/functionHandler";

export type DeclarationType = ClassType 
| StructType 
| InterfaceType 
| EnumType 
| VariableType
| FunctionType;