import {TypeDefinition} from "../typeDefinition";
import {TMaybeUndefined, TNullable} from "../../../utils/zrCompilerTypes";
import type {ScriptContext} from "../../../../common/scriptContext";

export class PredefinedType extends TypeDefinition<TMaybeUndefined<ScriptContext>> {
    private static readonly typeDefinitionMap: Map<string, PredefinedType> = new Map<string, PredefinedType>();

    public constructor() {
        super(undefined);
    }

    public static registerType(typeName: string, type: PredefinedType) {
        PredefinedType.typeDefinitionMap.set(typeName, type);
    }

    public static getPredefinedType(typeName: string): TNullable<PredefinedType> {
        return PredefinedType.typeDefinitionMap.get(typeName) ?? null;
    }
}
