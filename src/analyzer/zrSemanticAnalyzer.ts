import { ScriptContext } from "../common/scriptContext";
import { Handler } from "./semantic/common/handler";
import "./semantic/index";
export class ZrSemanticAnalyzer{
    private context: ScriptContext;
    private scriptHandler: Handler;
    public constructor(context: ScriptContext){
        this.context = context;
    }
    public analyze(){
        this.scriptHandler = Handler.handle(this.context.ast, this.context);
        
    }
}

