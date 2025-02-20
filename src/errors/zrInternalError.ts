import { ScriptContext } from "../common/scriptContext";
import { ZrErrorCode } from "../configurations/zrErrorCode";
import { ZrSemanticError } from "./zrSemanticError";

export class ZrInternalError extends ZrSemanticError{
    public get isFault(): boolean{
        return false;
    }

    public constructor(message: string, context: ScriptContext){
        super(ZrErrorCode.NoHandler, context);
        this.message = i(`internalError`,{message});
    }
}