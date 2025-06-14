import {Handler} from "../common/handler";
import {STRING} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";
import {ZrInternalError} from "../../../errors/zrInternalError";

export type StringType = {
    type: Keywords.StringLiteral,
    value: string,
    hasError: boolean
}

export class StringHandler extends Handler {
    public value: StringType;

    public _handle(node: STRING) {
        super._handle(node);
        let strValue = node.value;
        if (node.hasError) {
            strValue = "";
            new ZrInternalError(`String literal error: ${node.literal}`, this.context).report();
        }
        this.value = {
            type: Keywords.StringLiteral,
            value: strValue,
            hasError: node.hasError
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe another int
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.String);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe another int
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.String)!), this);
    }
}

Handler.registerHandler(Keywords.String, StringHandler);
