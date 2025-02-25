import { ScriptContext } from "../common/scriptContext";
import { ZrErrorCode } from "../configurations/zrErrorCode";
import { FileRange } from "../parser/generated/parser";
import { ZrSemanticError } from "./zrSemanticError";

export class DuplicatedIdentifierError extends ZrSemanticError {
    public get isFault(): boolean{
        return false;
    }

    public constructor(identifier: string, context: ScriptContext, duplicatedAt?: FileRange) {
        super(ZrErrorCode.DuplicatedIdentifier, context);
        if(duplicatedAt){
            const start = `${duplicatedAt.start.line}:${duplicatedAt.start.column}`;
            const end = `${duplicatedAt.end.line}:${duplicatedAt.end.column}`;
            this.message = i("duplicatedIdentifierError",{identifier, start, end});
        }else{
            this.message = i("duplicatedIdentifierError",{identifier, start:"?", end:"?"});
        }


    }
}