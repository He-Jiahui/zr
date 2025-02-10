import { Handler } from "../common/handler";
import { VALUENULL } from "../../../parser/generated/parser";
export type NullType = {
    type: "NullLiteral",
    value: null
}
export class NullHandler extends Handler{
    public value: NullType;
    
    public handle(node: VALUENULL) {
        super.handle(node);
        // this.value = node.value;
        this.value = {
            type: "NullLiteral",
            value: null,
        }
    }
}

Handler.registerHandler("Null", NullHandler);