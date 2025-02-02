import { Handler } from "../../common/handler";
import { Property, GetProperty, SetProperty } from "../../../../parser/generated/parser";
import { Access, PropertyType } from "../../../../types/access";
export type ClassPropertyType = {
    type: "ClassProperty";
    access: Access;
    propertyType: PropertyType;
    static: boolean;
    name: string;
    param: string;
    targetType: any;
    decorators: any[];
    body: any;
};

export class PropertyHandler extends Handler{
    public value: ClassPropertyType;
    private readonly decoratorHandlers: Handler[] = [];
    private targetTypeHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;

    public handle(node: Property) {
        super.handle(node);
        const access = node.access;
        const modifier = node.modifier as GetProperty | SetProperty;

        const name = modifier.name;
        const kind = modifier.kind as PropertyType; 
        if(modifier.targetType){
            this.targetTypeHandler = Handler.handle(modifier.targetType, this.context);
        }else{
            this.targetTypeHandler = null;
        }
        const decorators = node.decorator;
        const body = modifier.body;
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
            name,
            param: modifier.param as string,
            propertyType: kind,
            targetType: this.targetTypeHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler.value),
            body: this.bodyHandler
        };
    }
}

Handler.registerHandler("ClassProperty", PropertyHandler);