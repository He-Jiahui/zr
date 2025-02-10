import { Handler } from "../../common/handler";
import { MetaFunction } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
export type ClassMetaFunctionType = {
    type: "ClassMetaFunction";
    access: Access,
    static: boolean,
    meta: any,
    parameters: any[],
    super: any[],
    body: any
};

export class MetaFunctionHandler extends Handler{
    public value: ClassMetaFunctionType;

    private metaHandler: Handler|null = null;
    private readonly parameterHandlers: Handler[] = [];
    private bodyHandler: Handler|null = null;
    private readonly superHandlers: Handler[] = [];
    
    public handle(node: MetaFunction) {
        super.handle(node);
        if(node.meta){
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        }else{
            this.metaHandler = null;
        }
        this.superHandlers.length = 0;
        if(node.superArgs){
            for(const superNode of node.superArgs){
                const handler = Handler.handle(superNode, this.context);
                this.superHandlers.push(handler);
            }
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
            type: "ClassMetaFunction",
            access: node.access as Access,
            static: !!node.static,
            meta: this.metaHandler?.value,
            super: this.superHandlers.map(handler => handler?.value),
            parameters: this.parameterHandlers.map(handler => handler?.value),
            body: this.bodyHandler?.value,
        };
    }
}

Handler.registerHandler("ClassMetaFunction", MetaFunctionHandler);