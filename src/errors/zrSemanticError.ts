import {ScriptContext} from "../common/scriptContext";
import {ZrError} from "./zrError";
import {TMaybeUndefined} from "../analyzer/utils/zrCompilerTypes";

export class ZrSemanticError extends ZrError {
    public errCode: number;

    public constructor(errCode: number, context: TMaybeUndefined<ScriptContext>) {
        super(errCode, context?.fileName, context?.location);
        this.errCode = errCode;
    }
}
