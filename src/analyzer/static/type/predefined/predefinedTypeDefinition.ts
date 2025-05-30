import {TypeDefinition} from "../typeDefinition";

export class PredefinedTypeDefinition extends TypeDefinition {
    private static readonly typeDefinitionMap: Map<string, TypeDefinition> = new Map<string, TypeDefinition>();

}
