import { Handler } from "../common/handler";
import { STRING } from "../../../parser/generated/parser";
export type StringType = {
    type:"StringLiteral",
    value: string,
}
export class StringHandler extends Handler{
    public value: StringType;
    
    public handle(node: STRING) {
        super.handle(node);
        this.value = {
            type: "StringLiteral",
            value: node.value
        };
    }
}

Handler.registerHandler("String", StringHandler);