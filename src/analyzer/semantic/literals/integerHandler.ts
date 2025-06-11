import {Handler} from "../common/handler";
import {DECIMAL} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";

export type IntegerType = {
    type: Keywords.IntegerLiteral,
    value: number
};

export class IntegerHandler extends Handler {
    public value: IntegerType;

    public _handle(node: DECIMAL) {
        super._handle(node);
        this.value = {
            type: Keywords.IntegerLiteral,
            value: node.value
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe another int
        return TypeInferContext.createPredefinedTypeContext(TypeKeywords.Integer);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe another int
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Integer)!), this);
    }
}

Handler.registerHandler(Keywords.Integer, IntegerHandler);
