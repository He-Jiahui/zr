import {Handler} from "../common/handler";
import type {AllType} from "./types";
import {GenericType as GenericImplementType} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";
import type {IdentifierType} from "../declarations/identifierHandler";
import {TNullable} from "../../utils/zrCompilerTypes";

export type GenericType = {
    type: Keywords.Generic,
    name: IdentifierType,
    typeArguments: AllType[],
}

export class GenericImplementHandler extends Handler {
    public value: GenericType;
    private readonly typeArgumentsHandler: Handler[] = [];
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            ...this.typeArgumentsHandler
        ];
    }

    public _handle(node: GenericImplementType) {
        super._handle(node);
        const typeArguments = node.params;
        this.nameHandler = Handler.handle(node.name, this.context);
        this.typeArgumentsHandler.length = 0;
        for (const typeArgument of typeArguments) {
            const handler = Handler.handle(typeArgument, this.context);
            this.typeArgumentsHandler.push(handler);
        }
        this.value = {
            type: Keywords.Generic,
            name: this.nameHandler?.value,
            typeArguments: this.typeArgumentsHandler.map(handler => handler?.value)
        };
    }
}

Handler.registerHandler(Keywords.GenericType, GenericImplementHandler);
