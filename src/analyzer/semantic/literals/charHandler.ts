import {Handler} from "../common/handler";
import {CHAR} from "../../../parser/generated/parser";
import {Keywords} from "../../../types/keywords";

export type CharType = {
    type: Keywords.CharLiteral,
    value: string
}

export class CharHandler extends Handler {
    public value: CharType;

    public _handle(node: CHAR) {
        super._handle(node);
        this.value = {
            type: Keywords.CharLiteral,
            value: node.value
        };
    }
}

Handler.registerHandler(Keywords.Char, CharHandler);
