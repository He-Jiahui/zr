import type { BlockType } from "./blockHandler";
import "./blockHandler";
import "./expressionHandler";
import "./controls/index";
import { ExpressionStatementType } from "./expressionHandler";
import { ControlStatementType } from "./controls/index";
import type { DeclarationType } from "../declarations";

export type StatementType = BlockType 
| ExpressionStatementType 
| ControlStatementType
| DeclarationType;