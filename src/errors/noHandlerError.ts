import { ScriptContext } from "../common/scriptContext";
import { ZrErrorCode } from "../configurations/zrErrorCode";
import { ZrSemanticError } from "./zrSemanticError";

export class NoHandlerError extends ZrSemanticError{
    public get isFault(): boolean{
        return true;
    }

    public constructor(handleType: string, context: ScriptContext){
        super(ZrErrorCode.NoHandler, context);
        this.message = i(`noHandlerError`,{type: handleType});
    }
}