import {Handler} from "../../common/handler";
import {GetProperty, Property, SetProperty} from "../../../../parser/generated/parser";
import {Access, PropertyType} from "../../../../types/access";
import type {IdentifierType} from "../identifierHandler";
import type {AllType} from "../../types/types";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {BlockType} from "../../statements/blockHandler";
import { Symbol } from "../../../static/symbol/symbol";
import { PropertySymbol } from "../../../static/symbol/propertySymbol";
import { FunctionScope } from "../../../static/scope/functionScope";
import { FunctionSymbol } from "../../../static/symbol/functionSymbol";
import { ParameterSymbol } from "../../../static/symbol/parameterSymbol";

export type ClassPropertyType = {
    type: "ClassProperty";
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
    private targetTypeHandler: Handler | null = null;
    private bodyHandler: Handler | null = null;
    private nameHandler: Handler | null = null;
    private paramHandler: Handler | null = null;

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
            type: "ClassProperty",
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

    protected _collectDeclarations(): Symbol | undefined {
        const propertyName: string = this.value.name.name;
        const symbol = this.context.declare<PropertySymbol>(propertyName, "Property");
        symbol.accessibility = this.value.access;
        symbol.isStatic = this.value.static;
        const propertyType = this.value.propertyType;
        symbol.propertyType = propertyType;

        for(const decorator of this.value.decorators) {
            const handler = Handler.getHandler(decorator);
            symbol.decorators.push(handler?.collectDeclarations());
        }
        const isGetter = propertyType === PropertyType.GET;
        let functionSymbol: FunctionSymbol;
        if(isGetter) {
            const getterSymbol = this.context.declare<FunctionSymbol>(propertyName + "$Get", "Function");
            symbol.getterSymbol = getterSymbol;
            functionSymbol = getterSymbol;
        }else{
            const setterSymbol = this.context.declare<FunctionSymbol>(propertyName + "$Set", "Function");
            symbol.setterSymbol = setterSymbol;
            functionSymbol = setterSymbol;
        }
        functionSymbol.accessibility = this.value.access;
        functionSymbol.isStatic = this.value.static;
        functionSymbol.decorators.push(...symbol.decorators);
        const scope = this.pushScope<FunctionScope>("Function");
        scope.signature = functionSymbol;
        functionSymbol.body = scope;
        if(!isGetter){
            // add parameter
            const parameterSymbol = this.context.declare<ParameterSymbol>(this.value.param.name, "Parameter");
            // TODO parameterSymbol type should be determined by the propertyType
            scope.addParameter(parameterSymbol);
        }else{
            // TODO: add return type for getter
        }
        scope.setBody(Handler.getHandler(this.value.body)?.collectDeclarations());
        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("ClassProperty", PropertyHandler);