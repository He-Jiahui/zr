import "./switchHandler";
import "./returnHandler";
import "./ifHandler";
import "./whileHandler";
import "./forHandler";
import { IfStatementType } from "./ifHandler";
import { SwitchStatementType } from "./switchHandler";
import { ReturnStatementType } from "./returnHandler";
import { WhileLoopStatementType } from "./whileHandler";
import { ForeachLoopStatementType, ForLoopStatementType } from "./forHandler";

export type ControlStatementType = IfStatementType 
| SwitchStatementType 
| ReturnStatementType
| WhileLoopStatementType
| ForLoopStatementType
| ForeachLoopStatementType;