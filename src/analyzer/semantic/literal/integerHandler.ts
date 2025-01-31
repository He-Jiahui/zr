import { Handler } from "../common/handler";
import { DECIMAL } from "../../../parser/generated/parser";

export class IntegerHandler extends Handler{
    public value: number;
    
    public handle(node: DECIMAL) {
        super.handle(node);
        this.value = node.value;
    }
}

Handler.registerHandler("Integer", IntegerHandler);