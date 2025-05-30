import * as parser from "../../parser/generated/parser";
import {ModuleScope} from "../static/scope/moduleScope";
import {ModuleSymbol} from "../static/symbol/moduleSymbol";
import {Handler} from "./common/handler";
import type {ModuleDeclarationHandler, ModuleDeclarationType} from "./moduleDeclarationHandler";
import type {TopLevelStatementType} from "./statements";
import {TNullable} from "../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration} from "../static/symbol/symbol";
import {Scope} from "../static/scope/scope";
import {ClassSymbol} from "../static/symbol/classSymbol";
import {StructSymbol} from "../static/symbol/structSymbol";
import {InterfaceSymbol} from "../static/symbol/interfaceSymbol";
import {EnumSymbol} from "../static/symbol/enumSymbol";
import {FunctionSymbol} from "../static/symbol/functionSymbol";
import {VariableSymbol} from "../static/symbol/variableSymbol";
import {TestSymbol} from "../static/symbol/testSymbol";

export type ScriptType = {
    type: "Script",
    module: ModuleDeclarationType | undefined,
    statements: TopLevelStatementType[]
}

export class ScriptHandler extends Handler {
    public value: ScriptType;
    // 脚本模块
    public moduleHandler: TNullable<ModuleDeclarationHandler> = null;
    private readonly statementHandlers: Handler[] = [];

    protected get _children() {
        return [
            this.moduleHandler,
            ...this.statementHandlers
        ];
    }

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

    protected _createSymbolAndScope(parentScope: TNullable<Scope>) {
        let moduleName = "module";
        const moduleNameContainer = this.value.module?.name;
        if (moduleNameContainer?.type === "Identifier") {
            moduleName = moduleNameContainer.name;
        } else if (moduleNameContainer?.type === "StringLiteral") {
            moduleName = moduleNameContainer.value;
        } else {
            moduleName = this.context.fileName;
        }
        const symbol = this.declareSymbol<ModuleSymbol>(moduleName, "Module", parentScope);
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as ModuleScope;
        // collect module statement declarations
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "class": {
                    scope.addClass(child as ClassSymbol);
                }
                    break;
                case "struct": {
                    scope.addStruct(child as StructSymbol);
                }
                    break;
                case "interface": {
                    scope.addInterface(child as InterfaceSymbol);
                }
                    break;
                case "enum": {
                    scope.addEnum(child as EnumSymbol);
                }
                    break;
                case "test": {
                    scope.addTest(child as TestSymbol);
                }
                    break;
                case "function": {
                    scope.addFunction(child as FunctionSymbol);
                }
                    break;
                case "variable": {
                    scope.addVariable(child as VariableSymbol);
                }
                    break;
                default:
                    break;
            }
        }
        // TODO: debug only
        // prettyPrintSymbolTables(this._symbol);
        return currentScope.ownerSymbol;
    }
}

Handler.registerHandler("Script", ScriptHandler);
