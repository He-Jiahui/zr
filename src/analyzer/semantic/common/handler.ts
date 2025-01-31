import { ScriptContext } from "../../../common/scriptContext";
import { NoHandlerError } from "../../../errors/noHandlerError";
import { FileRange } from "../../../parser/generated/parser";

export type AnyNode = {
    type: string;
    location: FileRange;
    [key: string|number|symbol]: any;
}

export class Handler{
    private static handlers: Map<string, typeof Handler> = new Map();
    public static registerHandler(nodeType: string, handler: typeof Handler){
        Handler.handlers.set(nodeType, handler);
    }
    public static handle(node: AnyNode|any, context: ScriptContext){
        const handler = Handler.handlers.get(node.type)!;
        if(!handler){
            new NoHandlerError(node.type, context).report();
        }
        const h = new handler(context);
        h.handle(node);
        return h;
    }
    public context: ScriptContext;
    public constructor(context: ScriptContext){
        this.context = context;
    }

    protected handle(node: AnyNode|any):void{
        this.context.location = node.location;
    }
}

