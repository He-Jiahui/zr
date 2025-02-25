import { Parameter } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";
import type { IdentifierType } from "../declarations/identifierHandler";
import type { ExpressionType } from "../expressions";
import type { AllType } from "./types";

export type ParameterType = {
    type: "Parameter",
    name: IdentifierType,
    typeInfo: AllType,
    defaultValue: ExpressionType | null
}

export class ParameterHandler extends Handler{
    public value: ParameterType;
    private nameHandler: Handler | null = null;
    private typeInfoHandler: Handler | null = null;
    private defaultValueHandler: Handler | null = null;

    public _handle(node: Parameter) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const typeInfo = node.typeInfo;
        if(typeInfo){
            this.typeInfoHandler = Handler.handle(typeInfo, this.context);
        }else{
            this.typeInfoHandler = null;
        }
        if(node.defaultValue){
            this.defaultValueHandler = Handler.handle(node.defaultValue, this.context);
        }else{
            this.defaultValueHandler = null;
        }
        this.value = {
            type: "Parameter",
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            defaultValue: this.defaultValueHandler?.value,
        };
    }
}

Handler.registerHandler("Parameter", ParameterHandler);