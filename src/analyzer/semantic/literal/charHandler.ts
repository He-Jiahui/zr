import { Handler } from "../common/handler";
import { CHAR } from "../../../parser/generated/parser";

export class CharHandler extends Handler{
    public value: string;
    
    public handle(node: CHAR) {
        super.handle(node);
        this.value = node.value;
    }
}

Handler.registerHandler("Char", CharHandler);