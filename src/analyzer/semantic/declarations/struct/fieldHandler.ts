import { Handler } from "../../common/handler";
import { StructField } from "../../../../parser/generated/parser";
import { Access } from "../../../../types/access";
export type StructFieldType = {
    type: "StructField";
    access: Access,
    static: boolean,
    name: string,
    typeInfo: any,
    init: any,
};

export class FieldHandler extends Handler{
    public value: StructFieldType;

    private typeInfoHandler: Handler|null = null;
    private initHandler: Handler|null = null;
    
    public handle(node: StructField) {
        super.handle(node);
        if(node.typeInfo){
            const typeInfoHandler = Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        }else{
            this.typeInfoHandler = null;
        }
        if(node.init){
            const initHandler = Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        }else{
            this.initHandler = null;
        }
        this.value = {
            type: "StructField",
            access: node.access as Access,
            static: !!node.static,
            name: node.name,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value,
        };
    }
}

Handler.registerHandler("StructField", FieldHandler);