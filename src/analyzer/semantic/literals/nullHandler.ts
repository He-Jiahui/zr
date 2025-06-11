import {Handler} from "../common/handler";
import {VALUENULL} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";

export type NullType = {
    type: Keywords.NullLiteral,
    value: null
}

export class NullHandler extends Handler {
    public value: NullType;

    public _handle(node: VALUENULL) {
        super._handle(node);
        // this.value = node.value;
        this.value = {
            type: Keywords.NullLiteral,
            value: null
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe another int
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.Null);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe another int
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Null)!), this);
    }
}

Handler.registerHandler(Keywords.Null, NullHandler);
