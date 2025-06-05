import {Handler} from "../../common/handler";
import {StructMethod} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {ParameterType} from "../../types/parameterHandler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {BlockType} from "../../statements/blockHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import {Scope} from "../../../static/scope/scope";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {GenericSymbol} from "../../../static/symbol/genericSymbol";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";

export type StructMethodType = {
    type: Keywords.StructMethod;
    access: Access;
    static: boolean;
    name: IdentifierType;
    returnType: AllType;
    parameters: ParameterType[];
    args: ParameterType;
    generic: GenericDeclarationType;
    decorators: DecoratorExpressionType[];
    body: BlockType;
};

export class MethodHandler extends Handler {
    public value: StructMethodType;
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
            ...this.parameterHandlers,
            this.argsHandler,
            this.genericHandler,
            this.returnTypeHandler,
            ...this.decoratorHandlers,
            this.bodyHandler
        ];
    }

    public _handle(node: StructMethod) {
        super._handle(node);
        const access = node.access;
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
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = Handler.handle(node.args, this.context);
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
            type: Keywords.StructMethod,
            access: access as Access,
            static: !!node.static,
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
        symbol.isStatic = this.value.static;
        symbol.accessibility = this.value.access;
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

Handler.registerHandler(Keywords.StructMethod, MethodHandler);
