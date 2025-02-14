import { FunctionDeclaration } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { DecoratorExpressionType } from "../../expressions/decoratorHandler";
import type { BlockType } from "../../statements/blockHandler";
import type { GenericDeclarationType } from "../../types/genericDeclarationHandler";
import type { ParameterType } from "../../types/parameterHandler";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler";

export type FunctionType = {
    type: "Function",
    name: IdentifierType,
    returnType: AllType;
    parameters: ParameterType[];
    generic: GenericDeclarationType;
    decorators: DecoratorExpressionType[];
    body: BlockType;
}

export class FunctionHandler extends Handler{
    public value: FunctionType;
    private nameHandler: Handler | null = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private genericHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

    public handle(node: FunctionDeclaration) {
        super.handle(node);
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
            type: "Function",
            name: this.nameHandler?.value,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            generic: this.genericHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler?.value
        };
    }
}

Handler.registerHandler("FunctionDeclaration", FunctionHandler);