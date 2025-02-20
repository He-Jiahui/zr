
import { ScriptContext } from "../common/scriptContext";
import { ZrErrorCode } from "../configurations/zrErrorCode";
import { ZrError } from "./zrError";
import { FileRange } from "../parser/generated/parser";

export class ZrSyntaxError extends ZrError{
    public get isFault(): boolean{
        return true;
    }
    public constructor(context: ScriptContext, message: string){
        const range = context.syntaxErrorRange;
        const location:FileRange = context.syntaxErrorRange;
        
        super(ZrErrorCode.SyntaxError, context.filePath, location);
        if(range){
            this.message = i("syntaxError",{
                fromLine: range.start.line.toFixed(),
                fromColumn: range.start.column.toFixed(),
                toLine: range.end.line.toFixed(),
                toColumn: range.end.column.toFixed(), 
                message: message
            });
        }else{
            this.message = i("syntaxError2",{
                message: message
            });
        }
        
    }
}