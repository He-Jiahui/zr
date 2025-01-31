import { Handler } from "../common/handler";
import { BOOLEAN } from "../../../parser/generated/parser";
export class BooleanHandler extends Handler{
    public value: boolean;
    
    public handle(node: BOOLEAN) {
        super.handle(node);
        this.value = node.value;
    }
}

Handler.registerHandler("Boolean", BooleanHandler);