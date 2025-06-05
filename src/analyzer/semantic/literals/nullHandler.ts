import {Handler} from "../common/handler";
import {VALUENULL} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type NullType = {
    type: Keywords.NullLiteral,
    value: null
}

export class NullHandler extends Handler {
    public value: NullType;

    public _handle(node: VALUENULL) {
        super._handle(node);
        // this.value = node.value;
        this.value = {
            type: Keywords.NullLiteral,
            value: null,
        }
    }
}

Handler.registerHandler(Keywords.Null, NullHandler);
