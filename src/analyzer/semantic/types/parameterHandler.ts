import {Parameter} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import type {AllType} from "./types";
import {Symbol} from "../../static/symbol/symbol";
import {ParameterSymbol} from "../../static/symbol/parameterSymbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Scope} from "../../static/scope/scope";
import {Keywords} from "../../../types/keywords";
import type {ExpressionType} from "../expressions/types";
import {TypePlaceholder} from "../../static/type/typePlaceholder";

export type ParameterType = {
    type: Keywords.Parameter,
    name: IdentifierType,
    typeInfo: AllType,
    defaultValue: ExpressionType | null
}

export class ParameterHandler extends Handler {
    public value: ParameterType;
    private nameHandler: TNullable<Handler> = null;
    private typeInfoHandler: TNullable<Handler> = null;
    private defaultValueHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.defaultValueHandler
        ];
    }

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
            type: Keywords.Parameter,
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            defaultValue: this.defaultValueHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const name = this.value.name.name;
        const symbol = this.declareSymbol<ParameterSymbol>(name, Keywords.Parameter, parentScope);
        if (symbol) {
            symbol.typePlaceholder = TypePlaceholder.create(this.value.typeInfo, this);
        }
        return symbol;
    }

}

Handler.registerHandler(Keywords.Parameter, ParameterHandler);
