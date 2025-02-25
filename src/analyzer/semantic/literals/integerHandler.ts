import { Handler } from "../common/handler";
import { DECIMAL } from "../../../parser/generated/parser";
export type IntegerType = {
    type: "IntegerLiteral",
    value: number
};
export class IntegerHandler extends Handler{
    public value: IntegerType;
    
    public _handle(node: DECIMAL) {
        super._handle(node);
        this.value = {
            type: "IntegerLiteral",
            value: node.value
        };
    }
}

Handler.registerHandler("Integer", IntegerHandler);