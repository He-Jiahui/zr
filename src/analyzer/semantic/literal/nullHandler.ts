import { Handler } from "../common/handler";
import { VALUENULL } from "../../../parser/generated/parser";

export class NullHandler extends Handler{
    public value: null = null;
    
    public handle(node: VALUENULL) {
        super.handle(node);
        // this.value = node.value;
    }
}

Handler.registerHandler("Null", NullHandler);