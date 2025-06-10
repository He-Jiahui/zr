import {Handler} from "../../common/handler";
import {InterfaceMetaSignature} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {MetaType} from "../metaHandler";
import type {ParameterType} from "../../types/parameterHandler";
import {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";
import {TNullable} from "../../../utils/zrCompilerTypes";
import type {Scope} from "../../../static/scope/scope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {Keywords, SpecialSigns} from "../../../../types/keywords";

export type InterfaceMetaSignatureType = {
    type: Keywords.InterfaceMetaSignature;
    access: Access,
    meta: MetaType,
    parameters: ParameterType[],
    args: ParameterType,
};

export class InterfaceMetaSignatureHandler extends Handler {
    public value: InterfaceMetaSignatureType;

    private metaHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler
        ];
    }

    public _handle(node: InterfaceMetaSignature) {
        super._handle(node);
        if (node.meta) {
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        } else {
            this.metaHandler = null;
        }

        const parameters = node.params;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (node.args) {
            const argsHandler = Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        } else {
            this.argsHandler = null;
        }

        this.value = {
            type: Keywords.InterfaceMetaSignature,
            access: node.access as Access,
            meta: this.metaHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>) {
        const metaType = this.value.meta.name.name;
        const metaName = SpecialSigns.MetaSign + metaType;
        const symbol = this.declareSymbol<MetaSymbol>(metaName, Keywords.Meta, parentScope);
        if (symbol) {
            symbol.metaType = metaType;
            symbol.accessibility = this.value.access;
        }


        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as FunctionScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Parameter: {
                    scope.addParameter(child as ParameterSymbol);
                }
                    break;
            }
        }
        return currentScope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.InterfaceMetaSignature, InterfaceMetaSignatureHandler);
