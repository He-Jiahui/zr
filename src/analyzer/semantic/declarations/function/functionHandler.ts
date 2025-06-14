import {FunctionDeclaration} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import {FunctionScope} from "../../../static/scope/functionScope";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {Handler} from "../../common/handler";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {BlockType} from "../../statements/blockHandler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {GenericSymbol} from "../../../static/symbol/genericSymbol";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";
import {Keywords} from "../../../../types/keywords";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type FunctionType = {
    type: Keywords.Function,
    name: IdentifierType,
    returnType: AllType;
    parameters: ParameterType[];
    args: ParameterType;
    generic: GenericDeclarationType;
    decorators: DecoratorExpressionType[];
    body: BlockType;
}

export class FunctionHandler extends Handler {
    public value: FunctionType;
    private nameHandler: TNullable<Handler> = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private genericHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.genericHandler,
            this.returnTypeHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            ...this.decoratorHandlers,
            this.bodyHandler
        ];
    }

    public _handle(node: FunctionDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        if (node.generic) {
            this.genericHandler = Handler.handle(node.generic, this.context);
        } else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = Handler.handle(node.returnType, this.context);
        } else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        const decorators = node.decorator;
        const args = node.args;
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        if (parameters) {
            for (const parameter of parameters) {
                const handler = Handler.handle(parameter, this.context);
                this.parameterHandlers.push(handler);
            }
        }
        if (args) {
            this.argsHandler = Handler.handle(args, this.context);
        } else {
            this.argsHandler = null;
        }
        for (const decorator of decorators) {
            const handler = Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }
        this.value = {
            type: Keywords.Function,
            name: this.nameHandler?.value,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            generic: this.genericHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const funcName: string = this.value.name.name;
        const symbol = this.declareSymbol<FunctionSymbol>(funcName, Keywords.Function, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = Access.PUBLIC;
        symbol.isStatic = true;
        symbol.returnType = TypePlaceholder.create(this.value.returnType, this);
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {

        if (!currentScope) {
            return null;
        }
        const scope = currentScope as FunctionScope;

        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Generic: {
                    scope.addGeneric(child as GenericSymbol);
                }
                    break;
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

Handler.registerHandler(Keywords.FunctionDeclaration, FunctionHandler);
