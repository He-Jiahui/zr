import { Handler } from "../../common/handler";
import { MetaFunction } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
import type { MetaType } from "../metaHandler";
import type { ParameterType } from "../../types/parameterHandler";
import type { ExpressionType } from "../../expressions";
import type { BlockType } from "../../statements/blockHandler";
import { Symbol } from "../../../static/symbol/symbol";
import { FunctionSymbol } from "../../../static/symbol/functionSymbol";
import { FunctionScope } from "../../../static/scope/functionScope";
import { MetaSymbol } from "../../../static/symbol/metaSymbol";
export type ClassMetaFunctionType = {
    type: "ClassMetaFunction";
    access: Access,
    static: boolean,
    meta: MetaType,
    parameters: ParameterType[],
    args: ParameterType,
    super: ExpressionType[],
    body: BlockType
};

export class MetaFunctionHandler extends Handler{
    public value: ClassMetaFunctionType;

    private metaHandler: Handler|null = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: Handler|null = null;
    private bodyHandler: Handler|null = null;
    private readonly superHandlers: Handler[] = [];
    
    public _handle(node: MetaFunction) {
        super._handle(node);
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
        if(node.args){
            const argsHandler = Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        }else{
            this.argsHandler = null;
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
            args: this.argsHandler?.value,
            body: this.bodyHandler?.value,
        };
    }

    protected _collectDeclarations(): Symbol | undefined {
        const metaType = this.value.meta.name.name;
        const metaName = "@" + metaType;
        const symbol = this.context.declare<MetaSymbol>(metaName, "Meta");
        symbol.metaType = metaType;
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;

        const scope = this.pushScope<FunctionScope>("Function");
        scope.signature = symbol;
        symbol.body = scope;
        // TODO: add parameters and args to scope
        for(const parameter of this.value.parameters){
            const handler = Handler.getHandler(parameter);
            scope.addParameter(handler?.collectDeclarations());
        }
        if(this.value.args){
            const handler = Handler.getHandler(this.value.args);
            scope.setArgs(handler?.collectDeclarations());
        }
        // TODO:handle super calls

        const body = this.value.body;
        if(body){
            const handler = Handler.getHandler(body);
            scope.setBody(handler?.collectDeclarations());
        }

        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("ClassMetaFunction", MetaFunctionHandler);