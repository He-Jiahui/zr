import { Handler } from "../../common/handler";
import { StructMetaFunction } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
export type StructMetaFunctionType = {
    type: "StructMetaFunction";
    access: Access,
    static: boolean,
    meta: any,
    parameters: any[],
    body: any
};

export class MetaFunctionHandler extends Handler{
    public value: StructMetaFunctionType;

    private metaHandler: Handler|null = null;
    private readonly parameterHandlers: Handler[] = [];
    private bodyHandler: Handler|null = null;
    
    public handle(node: StructMetaFunction) {
        super.handle(node);
        if(node.meta){
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        }else{
            this.metaHandler = null;
        }
        const parameters = node.params;
        const body = node.body;
        this.parameterHandlers.length = 0;
        for(const parameter of parameters){
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if(body){
            this.bodyHandler = Handler.handle(body, this.context);
        }else{
            this.bodyHandler = null;
        }

        this.value = {
            type: "StructMetaFunction",
            access: node.access as Access,
            static: !!node.static,
            meta: this.metaHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler.value),
            body: this.bodyHandler?.value,
        };
    }
}

Handler.registerHandler("StructMetaFunction", MetaFunctionHandler);