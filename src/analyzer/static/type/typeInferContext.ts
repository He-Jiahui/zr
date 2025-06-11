import {TypeReference} from "./typeReference";
import {Symbol} from "../symbol/symbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {MetaType} from "./meta/metaType";
import {PredefinedType} from "./predefined/predefinedType";

export class TypeInferContext {
    public upperType: TNullable<TypeReference>;
    public inTypeChain: boolean;

    public static createTypeInferContext(upperSymbol: TNullable<Symbol>): TypeInferContext {
        const context = new TypeInferContext();
        if (upperSymbol?.generatedType) {
            context.upperType = TypeReference.createReference(upperSymbol.generatedType);
        }
        return context;
    }

    public static createPredefinedTypeContext(typeName: string): TypeInferContext {
        const context = new TypeInferContext();
        const predefined = PredefinedType.getPredefinedType(typeName);
        if (predefined) {
            context.upperType = TypeReference.createReference(predefined);
        }
        return context;
    }


    public generateDotType(symbolType: TNullable<MetaType<any>>) {
        this.upperType = symbolType ? TypeReference.createReference(symbolType, this.upperType) : null;
    }
}
