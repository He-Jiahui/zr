import {Handler} from "../../common/handler";
import {StructField} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import {Scope} from "../../../static/scope/scope";
import {Symbol} from "../../../static/symbol/symbol";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import type {ExpressionType} from "../../expressions/types";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type StructFieldType = {
    type: Keywords.StructField;
    access: Access,
    static: boolean,
    name: IdentifierType,
    typeInfo: AllType,
    init: ExpressionType,
};

export class FieldHandler extends Handler {
    public value: StructFieldType;
    private nameHandler: TNullable<Handler> = null;
    private typeInfoHandler: TNullable<Handler> = null;
    private initHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.initHandler
        ];
    }

    public _handle(node: StructField) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        if (node.typeInfo) {
            const typeInfoHandler = Handler.handle(node.typeInfo, this.context);
            this.typeInfoHandler = typeInfoHandler;
        } else {
            this.typeInfoHandler = null;
        }
        if (node.init) {
            const initHandler = Handler.handle(node.init, this.context);
            this.initHandler = initHandler;
        } else {
            this.initHandler = null;
        }
        this.value = {
            type: Keywords.StructField,
            access: node.access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const name = this.value.name.name;
        const symbol = this.declareSymbol<FieldSymbol>(name, Keywords.Field, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        symbol.typePlaceholder = TypePlaceholder.create(this.value.typeInfo, this);
        return symbol;
    }
}

Handler.registerHandler(Keywords.StructField, FieldHandler);
