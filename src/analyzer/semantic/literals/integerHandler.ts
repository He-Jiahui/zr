import {Handler} from "../common/handler";
import {DECIMAL} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type IntegerType = {
    type: Keywords.IntegerLiteral,
    value: number
};

export class IntegerHandler extends Handler {
    public value: IntegerType;

    public _handle(node: DECIMAL) {
        super._handle(node);
        this.value = {
            type: Keywords.IntegerLiteral,
            value: node.value
        };
    }
}

Handler.registerHandler(Keywords.Integer, IntegerHandler);
