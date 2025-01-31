import { ScriptContext } from "../common/scriptContext";
import { ZrErrorCode } from "../configurations/zrErrorCode";
import { ZrError } from "./zrError";

export class ZrParserError extends ZrError{
    public get isFault(): boolean{
        return true;
    }
    public constructor(context: ScriptContext, message: string){
        super(ZrErrorCode.ParserError, context.fileName);
        this.message = i("parserError",{
            message 
        });
    }
}