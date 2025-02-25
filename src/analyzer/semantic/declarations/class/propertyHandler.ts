import { Handler } from "../../common/handler";
import { Property, GetProperty, SetProperty } from "../../../../parser/generated/parser";
import { Access, PropertyType } from "../../../../types/access";
import type { IdentifierType } from "../identifierHandler";
import type { AllType } from "../../types/types";
import type { DecoratorExpressionType } from "../../expressions/decoratorHandler";
import type { BlockType } from "../../statements/blockHandler";
export type ClassPropertyType = {
    type: "ClassProperty";
    access: Access;
    propertyType: PropertyType;
    static: boolean;
    name: IdentifierType;
    param: IdentifierType;
    targetType: AllType;
    decorators: DecoratorExpressionType[];
    body: BlockType;
};

export class PropertyHandler extends Handler{
    public value: ClassPropertyType;
    private readonly decoratorHandlers: Handler[] = [];
    private targetTypeHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;
    private nameHandler: Handler | null = null;
    private paramHandler: Handler | null = null;

    public _handle(node: Property) {
        super._handle(node);
        const access = node.access;
        const modifier = node.modifier as GetProperty | SetProperty;

        const name = modifier.name;
        const kind = modifier.kind as PropertyType; 
        this.nameHandler = Handler.handle(name, this.context);
        if(modifier.targetType){
            this.targetTypeHandler = Handler.handle(modifier.targetType, this.context);
        }else{
            this.targetTypeHandler = null;
        }
        const decorators = node.decorator;
        const body = modifier.body;
        const param = modifier.param;
        if(param){ 
            this.paramHandler = Handler.handle(param, this.context);
        }else{
            this.paramHandler = null;
        }
        this.decoratorHandlers.length = 0;
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
            type: "ClassProperty",
            access: access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            param: this.paramHandler?.value,
            propertyType: kind,
            targetType: this.targetTypeHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler
        };
    }
}

Handler.registerHandler("ClassProperty", PropertyHandler);