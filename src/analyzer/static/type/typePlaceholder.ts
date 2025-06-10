import {TNullable} from "../../utils/zrCompilerTypes";
import {TypeReference} from "./typeReference";
import type {TypeHandler, TypeType} from "../../semantic/types/typeHandler";
import {Handler} from "../../semantic/common/handler";
import {ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";

export class TypePlaceholder extends ScriptContextAccessibleObject<ScriptContext> {
    public targetValueNode: TNullable<TypeType> = null;

    public get toTypeReference(): TNullable<TypeReference> {
        if (!this.targetValueNode) {
            return null;
        }
        const typeHandler = this.context.getHandlerFromValue(this.targetValueNode) as TypeHandler;
        return typeHandler.typeReference;
    }

    public static create(typeNode: TNullable<TypeType>, parentHandler: Handler) {
        const context = parentHandler.context;
        const placeholder = new TypePlaceholder(context);
        placeholder.targetValueNode = typeNode;
        return placeholder;
    }
}
