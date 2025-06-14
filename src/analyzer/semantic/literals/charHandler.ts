import {Handler} from "../common/handler";
import {CHAR} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";
import {ZrInternalError} from "../../../errors/zrInternalError";

export type CharType = {
    type: Keywords.CharLiteral,
    value: string,
    hasError: boolean
}

export class CharHandler extends Handler {
    public value: CharType;

    public _handle(node: CHAR) {
        super._handle(node);
        let charValue = node.value;
        if (node.hasError) {
            charValue = "";
            new ZrInternalError(`Character literal error: ${node.literal}`, this.context).report();
        }
        this.value = {
            type: Keywords.CharLiteral,
            value: charValue,
            hasError: node.hasError
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.Char);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Char)!), this);
    }
}

Handler.registerHandler(Keywords.Char, CharHandler);
