import {TMaybeUndefined} from "../../utils/zrCompilerTypes";
import {FileRange} from "../../../parser/generated/parser";

export class TypeDefinition {

    public name: TMaybeUndefined<string>;

    public location?: FileRange;

    public constructor(name: TMaybeUndefined<string>) {
        this.name = name;
    }
}

export class DefinedTypeSet {
    private readonly _types: Map<string, TypeDefinition> = new Map<string, TypeDefinition>();


    public registerType() {

    }
}
