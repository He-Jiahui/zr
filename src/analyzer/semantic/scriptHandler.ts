import * as parser from "../../parser/generated/parser";

import { Handler } from "./common/handler";
import { ModuleDeclarationHandler } from "./moduleDeclarationHandler";


export class ScriptHandler extends Handler{
    // 脚本模块
    public $module : ModuleDeclarationHandler;

    public analyze(start: parser.Start){
        const length = start.length;
        const moduleDeclaration = start[0];
        this.$module = Handler.handle(moduleDeclaration, this.context) as ModuleDeclarationHandler;
        
    }
}

Handler.registerHandler("Script", ScriptHandler);