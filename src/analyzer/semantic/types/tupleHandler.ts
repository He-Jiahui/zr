import {TupleType as TupleImplementType} from "../../../parser/generated/parser"
import {Handler} from "../common/handler"
import type {TypeType} from "./typeHandler";
import {Keywords} from "../../../types/keywords";

export type TupleType = {
    type: Keywords.Tuple,
    elements: TypeType[]
}

export class TupleImplementHandler extends Handler {
    private readonly elementsHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.elementsHandler
        ];
    }

    public _handle(node: TupleImplementType) {
        super._handle(node);
        this.elementsHandler.length = 0;
        if (node.elements) {
            for (const element of node.elements) {
                const handler = Handler.handle(element, this.context);
                this.elementsHandler.push(handler);
            }
        }
        this.value = {
            type: Keywords.Tuple,
            elements: this.elementsHandler.map(handler => handler?.value),
        };
    }
}

Handler.registerHandler(Keywords.TupleType, TupleImplementHandler);
