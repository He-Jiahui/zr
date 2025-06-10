import {InterfacePropertySignature} from "../../../../parser/generated/parser";
import {Access, PropertyType} from "../../../../types/access";
import {Handler} from "../../common/handler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords, SpecialSymbols} from "../../../../types/keywords";
import {Scope} from "../../../static/scope/scope";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {PropertySymbol} from "../../../static/symbol/propertySymbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {PropertyScope} from "../../../static/scope/propertyScope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";

export type InterfacePropertySignatureType = {
    type: Keywords.InterfacePropertySignature,
    name: IdentifierType,
    typeInfo: AllType,
    access: Access,
    propertyType: PropertyType,

}

export class InterfacePropertySignatureHandler extends Handler {
    public value: InterfacePropertySignatureType;
    private typeInfoHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.typeInfoHandler
        ];
    }

    public _handle(node: InterfacePropertySignature) {
        super._handle(node);
        const name = node.name;
        const nameHandler = Handler.handle(name, this.context);
        const access = node.access;
        const propertyType = node.propertyType;
        if (node.typeInfo) {
            this.typeInfoHandler = Handler.handle(node.typeInfo, this.context);
        } else {
            this.typeInfoHandler = null;
        }
        this.value = {
            type: Keywords.InterfacePropertySignature,
            name: nameHandler?.value,
            access: access as Access,
            typeInfo: this.typeInfoHandler?.value,
            propertyType: propertyType as PropertyType
        };
    }


    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const propertyName: string = this.value.name.name;
        const symbol = this.declareSymbol<PropertySymbol>(propertyName, Keywords.Property, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
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
            const parameterSymbol = this.declareSymbol<ParameterSymbol>("value", Keywords.Parameter, functionSymbol.childScope);
            // TODO parameterSymbol type should be determined by the propertyType
            const functionScope = functionSymbol.childScope as TNullable<FunctionScope>;
            if (functionScope) {
                functionScope.addParameter(parameterSymbol);
            }
        } else {
            // TODO: add return type for getter
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

Handler.registerHandler(Keywords.InterfacePropertySignature, InterfacePropertySignatureHandler);
