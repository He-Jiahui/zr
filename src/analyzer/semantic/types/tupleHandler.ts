
import { TupleType as TupleImplementType } from "../../../parser/generated/parser"
import { Handler } from "../common/handler"
import type { TypeType } from "./typeHandler";
export type TupleType = {
    type: "Tuple",
    elements: TypeType[]
}

export class TupleImplementHandler extends Handler {
    private readonly elementsHandler: Handler[];
    public handle(node: TupleImplementType){
        this.elementsHandler.length = 0;
        if(node.elements){
            for(const element of node.elements){
                const handler = Handler.handle(element, this.context);
                this.elementsHandler.push(handler);
            }
        }
        this.value = {
            type: "Tuple",
            elements: this.elementsHandler.map(handler=>handler.value),
        };
    }
}

Handler.registerHandler("TupleType", TupleImplementHandler);