import {Handler} from "../../common/handler";
import {Field} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import {Symbol} from "../../../static/symbol/symbol";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Scope} from "../../../static/scope/scope";
import {Keywords} from "../../../../types/keywords";
import type {ExpressionType} from "../../expressions/types";

export type ClassFieldType = {
    type: Keywords.ClassField;
    access: Access,
    static: boolean,
    name: IdentifierType,
    decorators: DecoratorExpressionType[],
    typeInfo: AllType,
    init: ExpressionType,
};

export class FieldHandler extends Handler {
    public value: ClassFieldType;
    private nameHandler: TNullable<Handler> = null;
    private typeInfoHandler: TNullable<Handler> = null;
    private initHandler: TNullable<Handler> = null;
    private readonly decoratorsHandlers: Handler[] = [];

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler,
            this.initHandler,
            ...this.decoratorsHandlers
        ];
    }

    public _handle(node: Field) {
        super._handle(node);
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
        this.decoratorsHandlers.length = 0;
        if (node.decorator) {
            for (const decorator of node.decorator) {
                const decoratorHandler = Handler.handle(decorator, this.context);
                this.decoratorsHandlers.push(decoratorHandler);
            }
        }
        this.nameHandler = Handler.handle(node.name, this.context);
        this.value = {
            type: Keywords.ClassField,
            access: node.access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value,
            decorators: this.decoratorsHandlers.map(handler => handler?.value)
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
        return symbol;
    }
}

Handler.registerHandler(Keywords.ClassField, FieldHandler);
