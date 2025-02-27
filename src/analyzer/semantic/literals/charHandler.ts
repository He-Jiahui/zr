import { Handler } from "../common/handler";
import { CHAR } from "../../../parser/generated/parser";
export type CharType = {
    type: "CharLiteral",
    value: string
}
export class CharHandler extends Handler{
    public value: CharType;
    
    public _handle(node: CHAR) {
        super._handle(node);
        this.value = {
            type: "CharLiteral",
            value: node.value
        };
    }
}

Handler.registerHandler("Char", CharHandler);