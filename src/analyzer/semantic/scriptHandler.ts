import * as parser from "../../parser/generated/parser";
import {ModuleScope} from "../static/scope/moduleScope";
import {ModuleSymbol} from "../static/symbol/moduleSymbol";
import {Handler} from "./common/handler";
import type {ModuleDeclarationHandler, ModuleDeclarationType} from "./moduleDeclarationHandler";
import type {TopLevelStatementType} from "./statements";
import {prettyPrintSymbolTables} from "../../utils/prettyPrint";

export type ScriptType = {
    type: "Script",
    module: ModuleDeclarationType | undefined,
    statements: TopLevelStatementType[]
}

export class ScriptHandler extends Handler {
    public value: ScriptType;
    // 脚本模块
    public moduleHandler: ModuleDeclarationHandler | null = null;
    private readonly statementHandlers: Handler[] = [];

    public _handle(start: parser.Start) {
        super._handle(start);
        const moduleDeclaration = start.moduleName;
        if (start.moduleName) {
            this.moduleHandler = Handler.handle(moduleDeclaration, this.context) as ModuleDeclarationHandler;
        } else {
            this.moduleHandler = null;
        }
        this.statementHandlers.length = 0;
        for (const statement of start.statements) {
            const handler = Handler.handle(statement, this.context);
            this.statementHandlers.push(handler);
        }
        this.value = {
            type: "Script",
            module: this.moduleHandler?.value,
            statements: this.statementHandlers.map(handler => handler?.value)
        }
    }

    private _symbol: ModuleSymbol | null = null;

    protected _collectDeclarations() {
        let moduleName = "module";
        const moduleNameContainer = this.value.module?.name;
        if (moduleNameContainer?.type === "Identifier") {
            moduleName = moduleNameContainer.name;
        } else if (moduleNameContainer?.type === "StringLiteral") {
            moduleName = moduleNameContainer.value;
        } else {
            moduleName = this.context.fileName;
        }

        const symbol = this.context.declare<ModuleSymbol>(moduleName, "Module", this.moduleHandler?.location);
        const scope = this.pushScope<ModuleScope>("Module");
        scope.moduleInfo = symbol;
        symbol.table = scope;

        // collect module statement declarations
        for (const statement of this.value.statements) {
            const handler = Handler.getHandler(statement);
            if (!handler) {
                continue;
            }
            switch (statement.type) {
                case "Class": {
                    scope.addClass(handler.collectDeclarations());
                }
                    break;
                case "Struct": {
                    scope.addStruct(handler.collectDeclarations());
                }
                    break;
                case "Interface": {
                    scope.addInterface(handler.collectDeclarations());
                }
                    break;
                case "Enum": {
                    scope.addEnum(handler.collectDeclarations());
                }
                    break;
                case "Function": {
                    scope.addFunction(handler.collectDeclarations());
                }
                    break;
                case "VariableDeclaration": {
                    scope.addVariable(handler.collectDeclarations());
                }
                    break;
                default: {
                    handler.collectDeclarations();
                }
                    break;
            }
        }

        this.popScope();

        this._symbol = symbol;
        // TODO: debug only
        prettyPrintSymbolTables(this._symbol);
        return symbol;
    }
}

Handler.registerHandler("Script", ScriptHandler);
