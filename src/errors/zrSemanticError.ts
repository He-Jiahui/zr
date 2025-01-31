import { ScriptContext } from "../common/scriptContext";
import { ZrError } from "./zrError";

export class ZrSemanticError extends ZrError{
    public errCode: number;
    public constructor(errCode: number, context: ScriptContext){
        super(errCode, context.fileName, context.location);
        this.errCode = errCode;
    }
}