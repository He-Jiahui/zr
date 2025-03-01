import "./returnHandler";
import "./breakContinueHandler";
import "./outHandler";
import {ReturnStatementType} from "./returnHandler";
import {WhileLoopExpressionType} from "../../expressions/whileHandler";
import {ForeachLoopExpressionType, ForLoopExpressionType} from "../../expressions/forHandler";
import {BreakContinueStatementType} from "./breakContinueHandler";
import {IfExpressionType} from "../../expressions/ifHandler";
import {SwitchExpressionType} from "../../expressions/switchHandler";
import {OutStatementType} from "./outHandler";

export type ControlStatementType = IfExpressionType
    | SwitchExpressionType
    | ReturnStatementType
    | BreakContinueStatementType
    | OutStatementType
    | WhileLoopExpressionType
    | ForLoopExpressionType
    | ForeachLoopExpressionType;