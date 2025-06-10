import {Handler} from "../../common/handler";
import {StructMetaFunction} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {MetaType} from "../metaHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {BlockType} from "../../statements/blockHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords, SpecialSigns} from "../../../../types/keywords";
import {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import type {Scope} from "../../../static/scope/scope";
import {FunctionScope} from "../../../static/scope/functionScope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";
import type {AllType} from "../../types/types";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type StructMetaFunctionType = {
    type: Keywords.StructMetaFunction;
    access: Access,
    static: boolean,
    meta: MetaType,
    parameters: ParameterType[],
    args: ParameterType,
    body: BlockType,
    returnType: AllType
};

export class MetaFunctionHandler extends Handler {
    public value: StructMetaFunctionType;

    private metaHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;
    private returnTypeHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler
        ];
    }

    public _handle(node: StructMetaFunction) {
        super._handle(node);
        if (node.meta) {
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        } else {
            this.metaHandler = null;
        }
        const parameters = node.params;
        const body = node.body;
        this.parameterHandlers.length = 0;
        for (const parameter of parameters) {
            const handler = Handler.handle(parameter, this.context);
            this.parameterHandlers.push(handler);
        }
        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }
        if (node.returnType) {
            this.returnTypeHandler = Handler.handle(node.returnType, this.context);
        } else {
            this.returnTypeHandler = null;
        }
        if (node.args) {
            const argsHandler = Handler.handle(node.args, this.context);
            this.argsHandler = argsHandler;
        } else {
            this.argsHandler = null;
        }

        this.value = {
            type: Keywords.StructMetaFunction,
            access: node.access as Access,
            static: !!node.static,
            meta: this.metaHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            body: this.bodyHandler?.value,
            returnType: this.returnTypeHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>) {
        const metaType = this.value.meta.name.name;
        const metaName = SpecialSigns.MetaSign + metaType;
        const symbol = this.declareSymbol<MetaSymbol>(metaName, Keywords.Meta, parentScope);
        if (symbol) {
            symbol.metaType = metaType;
            symbol.accessibility = this.value.access;
            symbol.isStatic = this.value.static;
            symbol.returnType = TypePlaceholder.create(this.value.returnType, this);
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
                case Keywords.Block: {
                    scope.setBody(child as BlockSymbol);
                }
                    break;
            }
        }
        return currentScope.ownerSymbol;
    }


}

Handler.registerHandler(Keywords.StructMetaFunction, MetaFunctionHandler);
