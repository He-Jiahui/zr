import { Handler } from "../common/handler";
import { BOOLEAN } from "../../../parser/generated/parser";
export type BooleanType = {
    type: "BooleanLiteral",
    value: boolean
}
export class BooleanHandler extends Handler{
    public value: BooleanType;
    
    public _handle(node: BOOLEAN) {
        super._handle(node);
        this.value = {
            type: "BooleanLiteral",
            value: node.value
        };
    }
}

Handler.registerHandler("Boolean", BooleanHandler);