import * as parser from "../../parser/generated/parser";

import { Handler } from "./common/handler";
import { ModuleDeclarationHandler, ModuleDeclarationType } from "./moduleDeclarationHandler";
import type { StatementType } from "./statements";

export type ScriptType = {
    type: "Script",
    module : ModuleDeclarationType | undefined,
    statements : StatementType[]
}

export class ScriptHandler extends Handler{
    public value: ScriptType;
    // 脚本模块
    public moduleHandler : ModuleDeclarationHandler | null = null;
    private readonly statementHandlers: Handler[] = [];
    public handle(start: parser.Start){
        super.handle(start);
        const moduleDeclaration = start.moduleName;
        if(start.moduleName){
            this.moduleHandler = Handler.handle(moduleDeclaration, this.context) as ModuleDeclarationHandler;
        }else{
            this.moduleHandler = null;
        }
        this.statementHandlers.length = 0;
        for(const statement of start.statements){
            const handler = Handler.handle(statement, this.context);
            this.statementHandlers.push(handler);
        }
        this.value = {
            type: "Script",
            module: this.moduleHandler?.value,
            statements: this.statementHandlers.map(handler => handler?.value)
        }
    }
}

Handler.registerHandler("Script", ScriptHandler);