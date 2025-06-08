import {TMaybeUndefined, TNullable} from "../../utils/zrCompilerTypes";
import {FileRange} from "../../../parser/generated/parser";
import {type ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";

export class TypeDefinition<T extends (ScriptContext | TMaybeUndefined<ScriptContext>)> extends ScriptContextAccessibleObject<T> {

    public name: TMaybeUndefined<string>;
    public location?: FileRange;

    public constructor(context: T) {
        super(context);
    }

    protected _isGeneric: boolean = false;

    public get isGeneric() {
        return this._isGeneric;
    }

    public get typeName() {
        return this._typeName;
    }

    protected get _typeName(): string {
        return this.name ?? "unknown";
    }

    protected _canBeAssignedBy(targetType: TypeDefinition<any>): boolean {
        return false;
    }

    protected _convertFrom<TFrom, TTo>(targetData: TFrom): TNullable<TTo> {
        return null;
    }
}

export class DefinedTypeSet {
    private readonly _types: Map<string, TypeDefinition<any>> = new Map<string, TypeDefinition<any>>();


    public registerType() {

    }
}
