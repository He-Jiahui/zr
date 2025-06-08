import type {TypeDefinition} from "./typeDefinition";
import {MetaType} from "./meta/metaType";
import {Symbol} from "../symbol/symbol";
import {TNullable} from "../../utils/zrCompilerTypes";

export class TypeReference {
    public upperTypeInfo: TNullable<TypeReference> = null;
    public targetType: TypeDefinition<any>;
    public readonly genericTypeArguments: TypeReference[] = [];

    public get name(): TNullable<string> {
        return this.targetType?.typeName;
    };

    public static createReference(targetType: TypeDefinition<any>, upperTypeInfo?: TNullable<TypeReference>) {
        const typeReference = new TypeReference();
        if (upperTypeInfo) {
            typeReference.upperTypeInfo = upperTypeInfo;
        }
        typeReference.targetType = targetType;

        return typeReference;
    }

    public userDeclaredType<T extends Symbol>(): TNullable<MetaType<T>> {
        if (this.targetType instanceof MetaType) {
            return this.targetType as MetaType<T>;
        }
        return null;
    }
}
