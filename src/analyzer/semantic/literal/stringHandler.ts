import { Handler } from "../common/handler";
import { STRING } from "../../../parser/generated/parser";
export class StringHandler extends Handler{
    public value: string;
    
    public handle(node: STRING) {
        super.handle(node);
        this.value = node.value;
    }
}

Handler.registerHandler("String", StringHandler);