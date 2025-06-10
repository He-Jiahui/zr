import type {BlockType} from "./blockHandler";
import type {ExpressionStatementType} from "./expressionHandler";
import type {ControlStatementType} from "./controls";
import type {VariableType} from "../declarations/variable/variableHandler";
import type {ReturnStatementType} from "./controls/returnHandler";
import type {DeclarationType} from "../declarations/types";

export type StatementType = BlockType
    | ExpressionStatementType
    | ControlStatementType
    | VariableType
    | ReturnStatementType
    ;

export type TopLevelStatementType = DeclarationType
    | ExpressionStatementType;
