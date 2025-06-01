import "./semantic/index";
import "./static/index";

import {ScriptContext} from "../common/scriptContext";
import {Handler} from "./semantic/common/handler";

import {ZrHandlerDispatcher} from "./utils/zrHandlerDispatcher";
import {TNullable} from "./utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration} from "./static/symbol/symbol";
import {prettyPrintSymbolTables} from "../utils/prettyPrint";

export class ZrSemanticAnalyzer {
    private context: ScriptContext;
    private scriptHandler: Handler;

    private topSymbol: SymbolDeclaration;

    private handlerDispatcher: ZrHandlerDispatcher;

    public constructor(context: ScriptContext) {
        this.context = context;
    }

    public analyze() {
        this.scriptHandler = Handler.handle(this.context.ast, this.context);

        this.handlerDispatcher = new ZrHandlerDispatcher(this.scriptHandler);

        // create symbol and scope
        this.topSymbol = this.handlerDispatcher.runTaskAround((handler, upperResult: TNullable<SymbolDeclaration>) => {
                return handler.createSymbolAndScope(upperResult?.childScope ?? null) ?? null;
            },
            (handler, lowerResult: Array<SymbolDeclaration>, selfTopDownResult: TNullable<SymbolDeclaration>) => {
                return handler.collectDeclarations(lowerResult, selfTopDownResult?.childScope ?? null) ?? selfTopDownResult;
            }) as SymbolDeclaration;
        prettyPrintSymbolTables(this.topSymbol);


    }
}
