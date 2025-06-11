import {Handler} from "../common/handler";
import {BOOLEAN} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";

export type BooleanType = {
    type: Keywords.BooleanLiteral,
    value: boolean
}

export class BooleanHandler extends Handler {
    public value: BooleanType;

    public _handle(node: BOOLEAN) {
        super._handle(node);
        this.value = {
            type: Keywords.BooleanLiteral,
            value: node.value
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.Boolean);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Boolean)!), this);
    }
}

Handler.registerHandler(Keywords.Boolean, BooleanHandler);
