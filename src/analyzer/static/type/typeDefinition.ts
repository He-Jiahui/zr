import {TMaybeUndefined, TNullable} from "../../utils/zrCompilerTypes";
import {FileRange} from "../../../parser/generated/parser";

export class TypeDefinition {

    public name: TMaybeUndefined<string>;

    public location?: FileRange;

    public constructor() {
    }

    public get typeName() {
        return this._typeName;
    }

    protected get _typeName(): string {
        return this.name ?? "unknown";
    }

    protected _canBeAssignedBy(targetType: TypeDefinition): boolean {
        return false;
    }

    protected _convertFrom<TFrom, TTo>(targetData: TFrom): TNullable<TTo> {
        return null;
    }
}

export class DefinedTypeSet {
    private readonly _types: Map<string, TypeDefinition> = new Map<string, TypeDefinition>();


    public registerType() {

    }
}
