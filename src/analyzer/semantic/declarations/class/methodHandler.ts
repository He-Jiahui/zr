import {Handler} from "../../common/handler";
import {Method} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {BlockType} from "../../statements/blockHandler";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {AllType} from "../../types/types";
import {Symbol} from "../../../static/symbol/symbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {FunctionScope} from "../../../static/scope/functionScope";

export type ClassMethodType = {
    type: "ClassMethod";
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
    public value: ClassMethodType;
    private nameHandler: Handler | null = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: Handler | null = null;
    private genericHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

    private _symbol: FunctionSymbol;

    public _handle(node: Method) {
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
            type: "ClassMethod",
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

    protected _collectDeclarations(): Symbol | undefined {
        const symbol = this.context.declare<FunctionSymbol>(this.value.name.name, "Function");
        const scope = this.pushScope<FunctionScope>("Function");
        symbol.body = scope;
        // todo: type is not available now
        // symbol.returnType = this.value.returnType;
        symbol.isStatic = this.value.static;

        scope.signature = symbol;
        // decorators
        for (const decorator of this.value.decorators) {
            const handler = Handler.getHandler(decorator);
            symbol.decorators.push(handler?.collectDeclarations());
        }
        // generics
        if (this.value.generic) {
            for (const generic of this.value.generic.typeArguments) {
                const handler = Handler.getHandler(generic);
                scope.addGeneric(handler?.collectDeclarations());
            }
        }
        // parameters
        for (const parameter of this.value.parameters) {
            const handler = Handler.getHandler(parameter);
            scope.addParameter(handler?.collectDeclarations());
        }

        // args
        if (this.value.args) {
            const handler = Handler.getHandler(this.value.args);
            scope.setArgs(handler?.collectDeclarations());
        }

        // body
        const body = this.value.body;
        if (body) {
            const handler = Handler.getHandler(body);
            scope.setBody(handler?.collectDeclarations());
        }

        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("ClassMethod", MethodHandler);