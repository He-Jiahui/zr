import type {BlockType} from "./blockHandler";
import "./blockHandler";
import "./expressionHandler";
import "./controls/index";
import type {ExpressionStatementType} from "./expressionHandler";
import type {ControlStatementType} from "./controls/index";
import type {DeclarationType} from "../declarations";
import type {VariableType} from "../declarations/variable/variableHandler";
import {ReturnStatementType} from "./controls/returnHandler";

export type StatementType = BlockType
    | ExpressionStatementType
    | ControlStatementType
    | VariableType
    | ReturnStatementType
    ;

export type TopLevelStatementType = DeclarationType
    | ExpressionStatementType;