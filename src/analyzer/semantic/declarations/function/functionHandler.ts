import {FunctionDeclaration} from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import {FunctionScope} from "../../../static/scope/functionScope";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {Handler} from "../../common/handler";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {BlockType} from "../../statements/blockHandler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";

export type FunctionType = {
    type: "Function",
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
    private nameHandler: Handler | null = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: Handler | null = null;
    private genericHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

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
            type: "Function",
            name: this.nameHandler?.value,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            generic: this.genericHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler?.value
        };
    }

    protected _collectDeclarations() {
        const funcName: string = this.value.name.name;
        const symbol = this.context.declare<FunctionSymbol>(funcName, "Function");

        const scope = this.pushScope<FunctionScope>("Function");
        scope.signature = symbol;
        symbol.body = scope;
        symbol.accessibility = Access.PUBLIC;
        symbol.isStatic = true;

        for (const decorator of this.value.decorators) {
            const handler = Handler.getHandler(decorator);
            symbol.decorators.push(handler?.collectDeclarations());
        }

        if (this.value.generic) {
            for (const generic of this.value.generic.typeArguments) {
                const handler = Handler.getHandler(generic);
                scope.addGeneric(handler?.collectDeclarations());
            }
        }


        for (const parameter of this.value.parameters) {
            const handler = Handler.getHandler(parameter);
            scope.addParameter(handler?.collectDeclarations());
        }

        scope.setArgs(Handler.getHandler(this.value.args)?.collectDeclarations());
        scope.setBody(Handler.getHandler(this.value.body)?.collectDeclarations());
        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("FunctionDeclaration", FunctionHandler);