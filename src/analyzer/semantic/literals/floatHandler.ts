import {Handler} from "../common/handler";
import {FLOAT} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";

export type FloatType = {
    type: Keywords.FloatLiteral,
    value: number
}

export class FloatHandler extends Handler {
    public value: FloatType;

    public _handle(node: FLOAT) {
        super._handle(node);
        this.value = {
            type: Keywords.FloatLiteral,
            value: node.value
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe float64
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.Float);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe float64
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Float)!), this);
    }
}

Handler.registerHandler(Keywords.Float, FloatHandler);
