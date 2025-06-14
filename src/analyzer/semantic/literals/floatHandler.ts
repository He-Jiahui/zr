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
    value: number,
    isSingle: boolean,
    literal: string,
    buffer: Buffer
}

export class FloatHandler extends Handler {
    public value: FloatType;
    private floatType: TypeKeywords;

    public _handle(node: FLOAT) {
        super._handle(node);
        this.floatType = node.isSingle ? TypeKeywords.Float : TypeKeywords.Double;
        this.value = {
            type: Keywords.FloatLiteral,
            value: node.value,
            isSingle: node.isSingle,
            literal: node.literal,
            buffer: this.toFloatBuffer(node.value, node.isSingle)
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe float64
        return TypeInferContext.createPredefinedTypeContext(this.floatType);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe float64
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(this.floatType)!), this);
    }

    private toFloatBuffer(value: number, isSingle: boolean): Buffer {
        const byteLength = isSingle ? 4 : 8;
        const buffer = new ArrayBuffer(byteLength);
        const view = new DataView(buffer);

        if (isSingle) {
            view.setFloat32(0, value, true); // 小端写入
        } else {
            view.setFloat64(0, value, true);
        }

        return Buffer.from(buffer);
    }
}

Handler.registerHandler(Keywords.Float, FloatHandler);
