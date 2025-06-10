import {Handler} from "../../common/handler";
import {GetProperty, Property, SetProperty} from "../../../../parser/generated/parser";
import {Access, PropertyType} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {BlockType} from "../../statements/blockHandler";
import {PropertySymbol} from "../../../static/symbol/propertySymbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";
import {PropertyScope} from "../../../static/scope/propertyScope";
import {Keywords, SpecialSymbols} from "../../../../types/keywords";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type ClassPropertyType = {
    type: Keywords.ClassProperty;
    access: Access;
    propertyType: PropertyType;
    static: boolean;
    name: IdentifierType;
    param: IdentifierType;
    targetType: AllType;
    decorators: DecoratorExpressionType[];
    body: BlockType;
};

export class PropertyHandler extends Handler {
    public value: ClassPropertyType;
    private readonly decoratorHandlers: Handler[] = [];
    private targetTypeHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;
    private paramHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.targetTypeHandler,
            ...this.decoratorHandlers,
            this.paramHandler,
            this.bodyHandler
        ];
    }

    public _handle(node: Property) {
        super._handle(node);
        const access = node.access;
        const modifier = node.modifier as GetProperty | SetProperty;

        const name = modifier.name;
        const kind = modifier.kind as PropertyType;
        this.nameHandler = Handler.handle(name, this.context);
        if (modifier.targetType) {
            this.targetTypeHandler = Handler.handle(modifier.targetType, this.context);
        } else {
            this.targetTypeHandler = null;
        }
        const decorators = node.decorator;
        const body = modifier.body;
        const param = modifier.param;
        if (param) {
            this.paramHandler = Handler.handle(param, this.context);
        } else {
            this.paramHandler = null;
        }
        this.decoratorHandlers.length = 0;
        for (const decorator of decorators) {
            const handler = Handler.handle(decorator, this.context);
            this.decoratorHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }
        this.value = {
            type: Keywords.ClassProperty,
            access: access as Access,
            static: !!node.static,
            name: this.nameHandler?.value,
            param: this.paramHandler?.value,
            propertyType: kind,
            targetType: this.targetTypeHandler?.value,
            decorators: this.decoratorHandlers.map(handler => handler?.value),
            body: this.bodyHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const propertyName: string = this.value.name.name;
        const symbol = this.declareSymbol<PropertySymbol>(propertyName, Keywords.Property, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        const propertyType = this.value.propertyType;
        symbol.propertyType = propertyType;

        const isGetter = propertyType === PropertyType.GET;
        let functionSymbol: TNullable<FunctionSymbol>;
        const scope = symbol.childScope as PropertyScope;
        if (isGetter) {
            const getterSymbol = this.declareSymbol<FunctionSymbol>(propertyName + SpecialSymbols.Get, Keywords.Function, symbol.childScope);
            scope.setGetter(getterSymbol);
            functionSymbol = getterSymbol;
        } else {
            const setterSymbol = this.declareSymbol<FunctionSymbol>(propertyName + SpecialSymbols.Set, Keywords.Function, symbol.childScope);
            scope.setSetter(setterSymbol);
            functionSymbol = setterSymbol;
        }
        if (!functionSymbol) {
            return symbol;
        }
        if (!isGetter) {
            // add parameter
            const parameterSymbol = this.declareSymbol<ParameterSymbol>(this.value.param.name, Keywords.Parameter, functionSymbol.childScope);
            // TODO parameterSymbol type should be determined by the propertyType
            const functionScope = functionSymbol.childScope as TNullable<FunctionScope>;
            if (functionScope) {
                functionScope.addParameter(parameterSymbol);
            }
            symbol.returnType = TypePlaceholder.create(this.value.targetType, this);
            if (parameterSymbol) {
                parameterSymbol.typePlaceholder = symbol.returnType;
            }
        } else {
            // TODO: add return type for getter
            symbol.returnType = TypePlaceholder.create(this.value.targetType, this);
            functionSymbol.returnType = symbol.returnType;
        }
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const propertyType = this.value.propertyType;

        const isGetter = propertyType === PropertyType.GET;
        const scope = currentScope as PropertyScope;

        const functionSymbol = isGetter ? scope.getterSymbol : scope.setterSymbol;
        if (!functionSymbol) {
            return null;
        }
        const functionScope = functionSymbol.childScope as TNullable<FunctionScope>;
        if (!functionScope) {
            return null;
        }
        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Parameter: {
                    functionScope.addParameter(child as ParameterSymbol);
                }
                    break;
                case Keywords.Block: {
                    functionScope.setBody(child as BlockSymbol);
                }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.ClassProperty, PropertyHandler);
