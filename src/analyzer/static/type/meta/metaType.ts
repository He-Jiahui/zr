import {TypeDefinition} from "../typeDefinition";
import {TNullable} from "../../../utils/zrCompilerTypes";
import type {ScriptContext} from "../../../../common/scriptContext";
import {Symbol} from "../../symbol/symbol";

export class MetaType<T extends Symbol> extends TypeDefinition<ScriptContext> {

    private static readonly metaTypeMap: Map<string, typeof MetaType<any>> = new Map();

    private _relatedSymbol: T;

    public get relatedSymbol() {
        return this._relatedSymbol;
    }

    public static registerType<TM extends Symbol>(typeName: string, type: typeof MetaType<TM>) {
        MetaType.metaTypeMap.set(typeName, type);
    }

    public static createType<TM extends MetaType<T>, T extends Symbol>(typeName: string, symbol: T): TNullable<TM> {
        const context = symbol.context;
        const prototype = MetaType.metaTypeMap.get(typeName);
        if (!prototype) {
            return null;
        }
        const instance = new prototype(context) as TM;
        instance._relatedSymbol = symbol;
        instance._onTypeCreated(symbol);
        return instance;
    }

    protected _onTypeCreated(symbol: T) {

    }
}
