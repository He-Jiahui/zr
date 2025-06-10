import {InterfaceMethodSignature} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import {Handler} from "../../common/handler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import {Scope} from "../../../static/scope/scope";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {GenericSymbol} from "../../../static/symbol/genericSymbol";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";

export type InterfaceMethodSignatureType = {
    type: Keywords.InterfaceMethodSignature,
    name: IdentifierType,
    returnType: AllType,
    parameters: ParameterType[],
    args: ParameterType,
    generic: GenericDeclarationType,
    access: Access,
}

export class InterfaceMethodSignatureHandler extends Handler {
    public value: InterfaceMethodSignatureType;
    private returnTypeHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private genericHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.genericHandler,
            this.returnTypeHandler
        ];
    }

    public _handle(node: InterfaceMethodSignature) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const access = node.access;
        if (node.generic) {
            this.genericHandler = Handler.handle(node.generic, this.context);
        } else {
            this.genericHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = Handler.handle(node.returnType, this.context);
        } else {
            this.returnTypeHandler = null;
        }
        const parameters = node.params;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            this.argsHandler = Handler.handle(node.args, this.context);
        } else {
            this.argsHandler = null;
        }
        this.value = {
            type: Keywords.InterfaceMethodSignature,
            name: this.nameHandler?.value,
            access: access as Access,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            generic: this.genericHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const funcName: string = this.value.name.name;
        const symbol = this.declareSymbol<FunctionSymbol>(funcName, Keywords.Function, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as FunctionScope;

        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Generic: {
                    scope.addGeneric(child as GenericSymbol);
                }
                    break;
                case Keywords.Parameter: {
                    scope.addParameter(child as ParameterSymbol);
                }
                    break;
                case Keywords.Block: {
                    scope.setBody(child as BlockSymbol);
                }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.InterfaceMethodSignature, InterfaceMethodSignatureHandler);
