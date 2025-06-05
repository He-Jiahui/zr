import {Handler} from "../common/handler";
import {BOOLEAN} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type BooleanType = {
    type: Keywords.BooleanLiteral,
    value: boolean
}

export class BooleanHandler extends Handler {
    public value: BooleanType;

    public _handle(node: BOOLEAN) {
        super._handle(node);
        this.value = {
            type: Keywords.BooleanLiteral,
            value: node.value
        };
    }
}

Handler.registerHandler(Keywords.Boolean, BooleanHandler);
