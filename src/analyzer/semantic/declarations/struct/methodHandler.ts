import { Handler } from "../../common/handler";
import { StructMethod } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import type { IdentifierType } from "../identifierHandler";
import type { AllType } from "../../types/types";
import type { ParameterType } from "../../types/parameterHandler";
import type { GenericDeclarationType } from "../../types/genericDeclarationHandler";
import type { DecoratorExpressionType } from "../../expressions/decoratorHandler";
import type { BlockType } from "../../statements/blockHandler";
export type StructMethodType = {
    type: "StructMethod";
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

export class MethodHandler extends Handler{
    public value: StructMethodType;
    private nameHandler: Handler | null = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: Handler | null = null;
    private genericHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

    public _handle(node: StructMethod) {
        super._handle(node);
        const access = node.access;
        this.nameHandler = Handler.handle(node.name, this.context);
        if(node.generic){
            this.genericHandler = Handler.handle(node.generic, this.context);
        }else{
            this.genericHandler = null;
        }
        if(node.returnType){
            this.returnTypeHandler = Handler.handle(node.returnType, this.context);
        }else{
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        const decorators = node.decorator;
        const body = node.body;
        this.parameterHandlers.length = 0;
        this.decoratorHandlers.length = 0;
        for(const parameter of parameters){
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if(node.args){
            this.argsHandler = Handler.handle(node.args, this.context);
        }else{
            this.argsHandler = null;
        }
        for(const decorator of decorators){
            const handler = Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if(body){
            this.bodyHandler = Handler.handle(body, this.context);
        }else{
            this.bodyHandler = null;
        }
        this.value = {
            type: "StructMethod",
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
}

Handler.registerHandler("StructMethod", MethodHandler);