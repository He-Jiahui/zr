import {ScriptContext} from "../common/scriptContext";
import {ZrErrorCode} from "../configurations/zrErrorCode";
import {FileRange} from "../parser/generated/parser";
import {ZrSemanticError} from "./zrSemanticError";
import {TMaybeUndefined} from "../analyzer/utils/zrCompilerTypes";

export class DuplicatedIdentifierError extends ZrSemanticError {
    public constructor(identifier: string, context: TMaybeUndefined<ScriptContext>, duplicatedAt?: FileRange) {
        super(ZrErrorCode.DuplicatedIdentifier, context);
        if (duplicatedAt) {
            const start = `${duplicatedAt.start.line}:${duplicatedAt.start.column}`;
            const end = `${duplicatedAt.end.line}:${duplicatedAt.end.column}`;
            this.message = i("duplicatedIdentifierError", {identifier, start, end});
        } else {
            this.message = i("duplicatedIdentifierError", {identifier, start: "?", end: "?"});
        }


    }

    public get isFault(): boolean {
        return false;
    }
}
