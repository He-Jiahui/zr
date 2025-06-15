import {Handler} from "../common/handler";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "./types";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";

export type FunctionCallType = {
    type: Keywords.FunctionCall,
    args: ExpressionType[];
};

export class FunctionCallHandler extends Handler {
    public value: FunctionCallType;
    public readonly argsHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.argsHandler
        ];
    }

    _handle(node: FunctionCallType) {
        super._handle(node);
        this.argsHandler.length = 0;
        if (node.args) {
            for (const arg of node.args) {
                const handler = Handler.handle(arg, this.context);
                this.argsHandler.push(handler);
            }
        }
        this.value = {
            type: Keywords.FunctionCall,
            args: this.argsHandler.map(handler => handler?.value)
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return super._inferType(upperTypeInferContext);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        return super._assignType(childrenContexts);
    }
}

Handler.registerHandler(Keywords.FunctionCall, FunctionCallHandler);
