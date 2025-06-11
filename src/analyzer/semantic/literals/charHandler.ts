import {Handler} from "../common/handler";
import {CHAR} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";

export type CharType = {
    type: Keywords.CharLiteral,
    value: string
}

export class CharHandler extends Handler {
    public value: CharType;

    public _handle(node: CHAR) {
        super._handle(node);
        this.value = {
            type: Keywords.CharLiteral,
            value: node.value
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
