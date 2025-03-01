import {Parameter} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import type {ExpressionType} from "../expressions";
import type {AllType} from "./types";
import {Symbol} from "../../static/symbol/symbol";
import {ParameterSymbol} from "../../static/symbol/parameterSymbol";

export type ParameterType = {
    type: "Parameter",
    name: IdentifierType,
    typeInfo: AllType,
    defaultValue: ExpressionType | null
}

export class ParameterHandler extends Handler {
    public value: ParameterType;
    private nameHandler: Handler | null = null;
    private typeInfoHandler: Handler | null = null;
    private defaultValueHandler: Handler | null = null;
    private _symbol: ParameterSymbol;

    public _handle(node: Parameter) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const typeInfo = node.typeInfo;
        if (typeInfo) {
            this.typeInfoHandler = Handler.handle(typeInfo, this.context);
        } else {
            this.typeInfoHandler = null;
        }
        if (node.defaultValue) {
            this.defaultValueHandler = Handler.handle(node.defaultValue, this.context);
        } else {
            this.defaultValueHandler = null;
        }
        this.value = {
            type: "Parameter",
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            defaultValue: this.defaultValueHandler?.value,
        };
    }

    protected _collectDeclarations(): Symbol | undefined {
        const symbol = this.context.declare<ParameterSymbol>(this.value.name.name, "Parameter");
        this._symbol = symbol;
        // if default value has block expression
        Handler.getHandler(this.value.defaultValue)?.collectDeclarations();
        return symbol;
    }
}

Handler.registerHandler("Parameter", ParameterHandler);