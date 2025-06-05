import {Handler} from "../common/handler";
import {FLOAT} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type FloatType = {
    type: Keywords.FloatLiteral,
    value: number
}

export class FloatHandler extends Handler {
    public value: FloatType;

    public _handle(node: FLOAT) {
        super._handle(node);
        this.value = {
            type: Keywords.FloatLiteral,
            value: node.value
        };
    }
}

Handler.registerHandler(Keywords.Float, FloatHandler);
