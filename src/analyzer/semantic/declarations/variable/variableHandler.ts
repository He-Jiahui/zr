import { VariableDeclaration } from "../../../../parser/generated/parser";
import { Handler } from "../../common/handler";
import type { ExpressionType } from "../../expressions";
import type { AllType } from "../../types/types";
import type { IdentifierType } from "../identifierHandler"
import type { DestructuringArrayType, DestructuringObjectType } from "./destructuringHandler";

export type VariableType = {
    type: "VariableDeclaration",
    pattern: IdentifierType | DestructuringArrayType | DestructuringObjectType;
    value: ExpressionType;
    typeInfo: AllType;
}

export class VariableHandler extends Handler{
    public value: VariableType;

    private patternHandler: Handler| null = null;
    private valueHandler: Handler| null = null;
    private typeHandler: Handler| null = null;

    public handle(node: VariableDeclaration): void {
        this.patternHandler = Handler.handle(node.pattern, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        if(node.typeInfo){
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        }else{
            this.typeHandler = null;
        }

        this.value = {
            type: "VariableDeclaration",
            pattern: this.patternHandler?.value,
            value: this.valueHandler?.value,
            typeInfo: this.typeHandler?.value
        }
    }
}

Handler.registerHandler("VariableDeclaration", VariableHandler);
