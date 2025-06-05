import {Handler} from "../common/handler";
import type {AllType} from "./types"
import {GenericType as GenericImplementType} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type GenericType = {
    type: Keywords.Generic,
    typeArguments: AllType[];
}

export class GenericImplementHandler extends Handler {
    public value: GenericType;
    private typeArgumentsHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.typeArgumentsHandler
        ];
    }

    public _handle(node: GenericImplementType) {
        super._handle(node);
        const typeArguments = node.params;
        this.typeArgumentsHandler.length = 0;
        for (const typeArgument of typeArguments) {
            const handler = Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: Keywords.Generic,
            typeArguments: this.typeArgumentsHandler.map(handler => handler?.value),
        };
    }
}

Handler.registerHandler(Keywords.GenericType, GenericImplementHandler);
