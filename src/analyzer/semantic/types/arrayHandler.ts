import { Handler } from "../common/handler";
import type { TypeType } from "./typeHandler";
import { ArrayType as ArrayImplementType } from "../../../parser/generated/parser";
export type ArrayType = {
    type: "Array",
    elementType: TypeType,
    dimensions: number
}

export class ArrayImplementHandler extends Handler{
    private elementTypeHandler: Handler | null = null;
    public value: ArrayType;
    public handle(node: ArrayImplementType) {
        super.handle(node);
        this.elementTypeHandler = Handler.handle(node.type, this.context);
        this.value = {
            type: "Array",
            elementType: this.elementTypeHandler?.value,
            dimensions: node.dimensions,
        };
    }
}

Handler.registerHandler("ArrayType", ArrayImplementHandler);

