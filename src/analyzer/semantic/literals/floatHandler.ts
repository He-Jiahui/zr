import { Handler } from "../common/handler";
import { FLOAT } from "../../../parser/generated/parser";

export class FloatHandler extends Handler{
    public value: number;
    
    public handle(node: FLOAT) {
        super.handle(node);
        this.value = node.value;
    }
}

Handler.registerHandler("Float", FloatHandler);