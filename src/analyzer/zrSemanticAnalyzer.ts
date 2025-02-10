import { ScriptContext } from "../common/scriptContext";
import { Handler } from "./semantic/common/handler";
import "./semantic/index";
export class ZrSemanticAnalyzer{
    private context: ScriptContext;
    public constructor(context: ScriptContext){
            this.context = context;
    }
    public analyze(){
        Handler.handle(this.context.ast, this.context);
    }
}

