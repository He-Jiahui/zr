import {StringType} from "../../literals/stringHandler";
import {ParameterType} from "../../types/parameterHandler";
import {BlockType} from "../../statements/blockHandler";
import {Handler} from "../../common/handler";
import {TestDeclaration} from "../../../../parser/generated/parser";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol, SymbolOrSymbolArray} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {TestSymbol} from "../../../static/symbol/testSymbol";
import {TestScope} from "../../../static/scope/testScope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";
import {Keywords, SpecialSigns} from "../../../../types/keywords";

export type TestType = {
    type: Keywords.Test,
    name: StringType,
    parameters: ParameterType[];
    args: ParameterType;
    body: BlockType;
}

export class TestHandler extends Handler {
    public value: TestType;
    private nameHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler
        ];
    }

    public _handle(node: TestDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);

        const parameters = node.params;
        const args = node.args;
        const body = node.body;
        this.parameterHandlers.length = 0;
        if (parameters) {
            for (const parameter of parameters) {
                this.parameterHandlers.push(Handler.handle(parameter, this.context));
            }
        }

        if (args) {
            this.argsHandler = Handler.handle(args, this.context);
        } else {
            this.argsHandler = null;
        }

        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }
        this.value = {
            type: Keywords.Test,
            name: this.nameHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value as ParameterType),
            args: this.argsHandler?.value,
            body: this.bodyHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const testName: string = SpecialSigns.TestSign + this.value.name.value;
        const symbol = this.declareSymbol<TestSymbol>(testName, Keywords.Test, parentScope);
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Symbol[], currentScope: TNullable<Scope>): SymbolOrSymbolArray {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as TestScope;

        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Parameter: {
                    scope.addParameter(child as ParameterSymbol);
                }
                    break;
                case Keywords.Block: {
                    scope.setBody(child as BlockSymbol);
                }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.TestDeclaration, TestHandler);
