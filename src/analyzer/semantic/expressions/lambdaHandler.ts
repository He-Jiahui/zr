import {LambdaExpression} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {BlockType} from "../statements/blockHandler";
import type {ParameterType} from "../types/parameterHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration, Symbol} from "../../static/symbol/symbol";
import {Scope} from "../../static/scope/scope";
import {FunctionSymbol} from "../../static/symbol/functionSymbol";
import {Access} from "../../../types/access";
import {FunctionScope} from "../../static/scope/functionScope";
import {ParameterSymbol} from "../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../static/symbol/blockSymbol";
import {Keywords, SpecialSymbols} from "../../../types/keywords";

export type LambdaType = {
    type: Keywords.LambdaExpression,
    params: ParameterType[],
    args: ParameterType,
    blocks: BlockType,
}

export class LambdaHandler extends Handler {
    public value: LambdaType;
    private readonly paramsHandler: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private blockHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            ...this.paramsHandler,
            this.argsHandler,
            this.blockHandler
        ];
    }

    public _handle(node: LambdaExpression): void {
        super._handle(node);
        this.paramsHandler.length = 0;
        for (const param of node.params) {
            const handler = Handler.handle(param, this.context);
            this.paramsHandler.push(handler);
        }
        if (node.args) {
            this.argsHandler = Handler.handle(node.args, this.context);
        } else {
            this.argsHandler = null;
        }

        this.blockHandler = Handler.handle(node.block, this.context);

        this.value = {
            type: Keywords.LambdaExpression,
            params: this.paramsHandler.map(handler => handler?.value as ParameterType),
            args: this.argsHandler?.value as ParameterType,
            blocks: this.blockHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const symbol = this.declareSymbol<FunctionSymbol>(SpecialSymbols.Lambda, Keywords.Function, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = Access.PUBLIC;
        symbol.isStatic = true;
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
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.LambdaExpression, LambdaHandler);
