import {Handler} from "../../common/handler";
import {StructField} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {ExpressionType} from "../../expressions";
import {TNullable} from "../../../utils/zrCompilerTypes";

export type StructFieldType = {
    type: "StructField";
    access: Access,
    static: boolean,
    name: IdentifierType,
    typeInfo: AllType,
    init: ExpressionType,
};

export class FieldHandler extends Handler {
    public value: StructFieldType;
    private nameHandler: TNullable<Handler> = null;
    private typeInfoHandler: TNullable<Handler> = null;
    private initHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.initHandler,
        ];
    }

    public _handle(node: StructField) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        if (node.typeInfo) {
            const typeInfoHandler = Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        } else {
            this.typeInfoHandler = null;
        }
        if (node.init) {
            const initHandler = Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        } else {
            this.initHandler = null;
        }
        this.value = {
            type: "StructField",
            access: node.access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value,
        };
    }
}

Handler.registerHandler("StructField", FieldHandler);
