import type {ScriptType} from "./scriptHandler";
import type {ModuleDeclarationType} from "./moduleDeclarationHandler";
import type {TypeType} from "./types/typeHandler";
import type {StatementType, TopLevelStatementType} from "./statements/types";
import type {LiteralType} from "./literals/types";
import type {ExpressionType} from "./expressions/types";
import type {DeclarationType} from "./declarations/types";

export type AllGrammarType = ScriptType
    | ModuleDeclarationType
    | TypeType
    | StatementType
    | TopLevelStatementType
    | LiteralType
    | ExpressionType
    | DeclarationType
    ;
