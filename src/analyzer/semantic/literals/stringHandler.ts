import {Handler} from "../common/handler";
import {STRING} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type StringType = {
    type: Keywords.StringLiteral,
    value: string,
}

export class StringHandler extends Handler {
    public value: StringType;

    public _handle(node: STRING) {
        super._handle(node);
        this.value = {
            type: Keywords.StringLiteral,
            value: node.value
        };
    }
}

Handler.registerHandler(Keywords.String, StringHandler);
