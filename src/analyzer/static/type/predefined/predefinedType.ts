import {TypeDefinition} from "../typeDefinition";
import {TNullable} from "../../../utils/zrCompilerTypes";

export class PredefinedType extends TypeDefinition {
    private static readonly typeDefinitionMap: Map<string, TypeDefinition> = new Map<string, TypeDefinition>();

    public static registerType(typeName: string, type: PredefinedType) {
        PredefinedType.typeDefinitionMap.set(typeName, type);
    }

    public static getPredefinedType(typeName: string): TNullable<TypeDefinition> {
        return PredefinedType.typeDefinitionMap.get(typeName) ?? null;
    }
}
