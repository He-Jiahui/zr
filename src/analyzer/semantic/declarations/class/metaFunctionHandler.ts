import {Handler} from "../../common/handler";
import {MetaFunction} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import type {MetaType} from "../metaHandler";
import type {ParameterType} from "../../types/parameterHandler";
import type {BlockType} from "../../statements/blockHandler";
import {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {FunctionScope} from "../../../static/scope/functionScope";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";
import {TNullable} from "../../../utils/zrCompilerTypes";
import type {Scope} from "../../../static/scope/scope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";
import {Keywords, SpecialSigns} from "../../../../types/keywords";
import type {ExpressionType} from "../../expressions/types";

export type ClassMetaFunctionType = {
    type: Keywords.ClassMetaFunction;
    access: Access,
    static: boolean,
    meta: MetaType,
    parameters: ParameterType[],
    args: ParameterType,
    super: ExpressionType[],
    body: BlockType
};

export class MetaFunctionHandler extends Handler {
    public value: ClassMetaFunctionType;

    private metaHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private bodyHandler: TNullable<Handler> = null;
    private readonly superHandlers: Handler[] = [];

    protected get _children() {
        return [
            this.metaHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            this.bodyHandler,
            ...this.superHandlers
        ];
    }

    public _handle(node: MetaFunction) {
        super._handle(node);
        if (node.meta) {
            const metaHandler = Handler.handle(node.meta, this.context);
            this.metaHandler = metaHandler;
        } else {
            this.metaHandler = null;
        }
        this.superHandlers.length = 0;
        if (node.superArgs) {
            for (const superNode of node.superArgs) {
                const handler = Handler.handle(superNode, this.context);
                this.superHandlers.push(handler);
            }
        }

        const parameters = node.params;
        const body = node.body;
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
        if (body) {
            this.bodyHandler = Handler.handle(body, this.context);
        } else {
            this.bodyHandler = null;
        }

        this.value = {
            type: Keywords.ClassMetaFunction,
            access: node.access as Access,
            static: !!node.static,
            meta: this.metaHandler?.value,
            super: this.superHandlers.map(handler => handler?.value),
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            body: this.bodyHandler?.value
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

Handler.registerHandler(Keywords.ClassMetaFunction, MetaFunctionHandler);
