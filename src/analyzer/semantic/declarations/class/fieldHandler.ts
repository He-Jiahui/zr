import {Handler} from "../../common/handler";
import {Field} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {ExpressionType} from "../../expressions";
import {Symbol} from "../../../static/symbol/symbol";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";

export type ClassFieldType = {
    type: "ClassField";
    access: Access,
    static: boolean,
    name: IdentifierType,
    decorators: DecoratorExpressionType[],
    typeInfo: AllType,
    init: ExpressionType,
};

export class FieldHandler extends Handler {
    public value: ClassFieldType;
    private nameHandler: Handler | null = null;
    private typeInfoHandler: Handler | null = null;
    private initHandler: Handler | null = null;
    private readonly decoratorsHandlers: Handler[] = [];

    private _symbol: FieldSymbol;

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
            type: "ClassField",
            access: node.access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            typeInfo: this.typeInfoHandler?.value,
            init: this.initHandler?.value,
            decorators: this.decoratorsHandlers.map(handler => handler?.value),
        };
    }

    protected _collectDeclarations(): Symbol | undefined {
        const symbol = this.context.declare<FieldSymbol>(this.value.name.name, "Field");
        this._symbol = symbol;
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        for (const decorator of this.value.decorators) {
            const handler = Handler.getHandler(decorator);
            symbol.decorators.push(handler?.collectDeclarations());
        }
        return symbol;
    }
}

Handler.registerHandler("ClassField", FieldHandler);