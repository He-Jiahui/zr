import {Handler} from "../../common/handler";
import {StructMetaFunction} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {MetaType} from "../metaHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {BlockType} from "../../statements/blockHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type StructMetaFunctionType = {
    type: "StructMetaFunction";
    access: Access,
    static: boolean,
    meta: MetaType,
    parameters: ParameterType[],
    args: ParameterType,
    body: BlockType
};

export class MetaFunctionHandler extends Handler {
    public value: StructMetaFunctionType;

    private metaHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler
        ];
    }

    public _handle(node: StructMetaFunction) {
        super._handle(node);
        if (node.meta) {
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        } else {
            this.metaHandler = null;
        }
        const parameters = node.params;
        const body = node.body;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }
        if (node.args) {
            const argsHandler = Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        } else {
            this.argsHandler = null;
        }

        this.value = {
            type: "StructMetaFunction",
            access: node.access as Access,
            static: !!node.static,
            meta: this.metaHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            body: this.bodyHandler?.value,
        };
    }
}

Handler.registerHandler("StructMetaFunction", MetaFunctionHandler);
