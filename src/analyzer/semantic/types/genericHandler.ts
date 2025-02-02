import { Handler } from "../common/handler";
import type { Type } from "./types"
import { GenericType as GenericImplementType } from "../../../parser/generated/parser";
export type GenericType = {
    type: "Generic",
    typeArguments: Type[];
}

export class GenericImplementHandler extends Handler{
    public value: GenericType;
    private typeArgumentsHandler: Handler[] = [];

    public handle(node: GenericImplementType) {
        super.handle(node);
        const typeArguments = node.params;
        this.typeArgumentsHandler.length = 0;
        for(const typeArgument of typeArguments){
            const handler = Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: "Generic",
            typeArguments: this.typeArgumentsHandler.map(handler=>handler.value),
        };
    }
}

Handler.registerHandler("GenericType", GenericImplementHandler);