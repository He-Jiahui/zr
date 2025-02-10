import { Handler } from "../../common/handler";
import { Method } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import type { IdentifierType } from "../identifierHandler";
export type ClassMethodType = {
    type: "ClassMethod";
    access: Access;
    static: boolean;
    name: IdentifierType;
    returnType: any;
    parameters: any[];
    generic: any;
    decorators: any[];
    body: any;
};

export class MethodHandler extends Handler{
    public value: ClassMethodType;
    private nameHandler: Handler | null = null;
    private readonly decoratorHandlers: Handler[] = [];
    private returnTypeHandler: Handler | null = null;
    private readonly parameterHandlers: Handler[] = [];
    private genericHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

    public handle(node: Method) {
        super.handle(node);
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
            type: "ClassMethod",
            access: access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            generic: this.genericHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler
        };
    }
}

Handler.registerHandler("ClassMethod", MethodHandler);