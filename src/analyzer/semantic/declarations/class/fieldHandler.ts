import { Handler } from "../../common/handler";
import { Field } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
export type ClassFieldType = {
    type: "ClassField";
    access: Access,
    static: boolean,
    name: string,
    decorators: any[],
    typeInfo: any,
    init: any,
};

export class FieldHandler extends Handler{
    public value: ClassFieldType;

    private typeInfoHandler: Handler|null = null;
    private initHandler: Handler|null = null;
    private readonly decoratorsHandlers: Handler[] = [];
    
    public handle(node: Field) {
        super.handle(node);
        if(node.typeInfo){
            const typeInfoHandler = Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        }else{
            this.typeInfoHandler = null;
        }
        if(node.init){
            const initHandler = Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        }else{
            this.initHandler = null;
        }
        this.decoratorsHandlers.length = 0;
        if(node.decorator){
            for(const decorator of node.decorator){
                const decoratorHandler = Handler.handle(decorator, this.context);
                this.decoratorsHandlers.push(decoratorHandler);
            }
        }
        this.value = {
            type: "ClassField",
            access: node.access as Access,
            static: !!node.static,
            name: node.name,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value,
            decorators: this.decoratorsHandlers.map(handler=>handler.value),
        };
    }
}

Handler.registerHandler("ClassField", FieldHandler);