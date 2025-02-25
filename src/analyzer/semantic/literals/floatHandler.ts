import { Handler } from "../common/handler";
import { FLOAT } from "../../../parser/generated/parser";
export type FloatType = {
    type: "FloatLiteral",
    value: number
}
export class FloatHandler extends Handler{
    public value: FloatType;
    
    public _handle(node: FLOAT) {
        super._handle(node);
        this.value = {
            type: "FloatLiteral",
            value: node.value
        };
    }
}

Handler.registerHandler("Float", FloatHandler);