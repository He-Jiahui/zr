import { Parameter } from "../../../parser/generated/parser";
import { Handler } from "../common/handler";

export type ParameterType = {
    type: "Parameter",
    name: string,
    typeInfo: any,
    defaultValue: any | null
}

export class ParameterHandler extends Handler{
    public value: ParameterType;
    private typeInfoHandler: Handler | null = null;
    private defaultValueHandler: Handler | null = null;

    public handle(node: Parameter) {
        super.handle(node);
        const name = node.name;
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
            name,
            typeInfo: this.typeInfoHandler?.value,
            defaultValue: this.defaultValueHandler?.value,
        };
    }
}

Handler.registerHandler("Parameter", ParameterHandler);