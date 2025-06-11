import "./semantic/index";
import "./static/index";

import {ScriptContext} from "../common/scriptContext";
import {Handler} from "./semantic/common/handler";

import {ZrHandlerDispatcher} from "./utils/zrHandlerDispatcher";
import {TMaybeArray, TNullable} from "./utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration} from "./static/symbol/symbol";
import {prettyPrintSymbolTables} from "../utils/prettyPrint";
import type {TypeInferContext} from "./static/type/typeInferContext";
import type {TypeAssignContext} from "./static/type/typeAssignContext";

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
                return handler.createSymbolAndScope(upperResult?.childScope ?? upperResult?.ownerScope ?? null) ?? null;
            },
            (handler, lowerResult: Array<SymbolDeclaration>, selfTopDownResult: TNullable<SymbolDeclaration>) => {
                return handler.collectDeclarations(lowerResult, selfTopDownResult?.childScope ?? null) ?? selfTopDownResult;
            }) as SymbolDeclaration;

        const typeInferResult = this.handlerDispatcher.runTaskAround((handler, upperResult: TNullable<TypeInferContext>) => {
                return handler.inferType(upperResult);
            },
            (handler, lowerResult: Array<TypeInferContext>, selfTopDownResult: TNullable<TypeInferContext>) => {
                return handler.inferTypeBack(lowerResult, selfTopDownResult);
            });

        const typeAssignResult = this.handlerDispatcher.runTaskBottomUp<TypeAssignContext>((handler, lowerResult: TNullable<TMaybeArray<TypeAssignContext>>) => {
            if (lowerResult instanceof Array) {
                return handler.assignType(lowerResult);
            } else if (lowerResult) {
                return handler.assignType([lowerResult]);
            }
            return handler.assignType([]);
        });
        prettyPrintSymbolTables(this.topSymbol);


    }
}
