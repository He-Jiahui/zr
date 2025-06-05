import {Keywords, SpecialSymbols} from "../../../../types/keywords";
import type {BlockType} from "../blockHandler";
import type {ParameterType} from "../../types/parameterHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Handler} from "../../common/handler";
import type {TryCatchFinallyStatement} from "../../../../parser/generated/parser";
import {Symbol, SymbolOrSymbolArray} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {TrySymbol} from "../../../static/symbol/trySymbol";
import {TryScope} from "../../../static/scope/tryScope";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {BlockSymbol} from "../../../static/symbol/blockSymbol";

export type TryCatchFinallyStatementType = {
    type: Keywords.TryCatchFinallyStatement,
    block: BlockType,
    catchPattern: ParameterType[],
    catchBlock: TNullable<BlockType>,
    finallyBlock: TNullable<BlockType>
}


export class TryCatchFinallyStatementHandler extends Handler {
    public value: TryCatchFinallyStatementType;

    private blockHandler: TNullable<Handler> = null;
    private readonly catchPatternHandlers: Handler[] = [];
    private catchBlockHandler: TNullable<Handler> = null;
    private finallyBlockHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.blockHandler,
            ...this.catchPatternHandlers,
            this.catchBlockHandler,
            this.finallyBlockHandler
        ];
    }

    public _handle(node: TryCatchFinallyStatement) {
        super._handle(node);
        this.blockHandler = Handler.handle(node.block, this.context);
        this.blockHandler.signByParentHandler(SpecialSymbols.Try);

        this.catchPatternHandlers.length = 0;
        if (node.catchPattern) {
            for (const pattern of node.catchPattern) {
                this.catchPatternHandlers.push(Handler.handle(pattern, this.context));
            }
        }
        if (node.catchBlock) {
            this.catchBlockHandler = Handler.handle(node.catchBlock, this.context);
            this.catchBlockHandler.signByParentHandler(SpecialSymbols.Catch);
        } else {
            this.catchBlockHandler = null;
        }
        if (node.finallyBlock) {
            this.finallyBlockHandler = Handler.handle(node.finallyBlock, this.context);
            this.finallyBlockHandler.signByParentHandler(SpecialSymbols.Finally);
        } else {
            this.finallyBlockHandler = null;
        }

        this.value = {
            type: Keywords.TryCatchFinallyStatement,
            block: this.blockHandler.value,
            catchPattern: this.catchPatternHandlers.map(handler => handler?.value),
            catchBlock: this.catchBlockHandler?.value,
            finallyBlock: this.finallyBlockHandler?.value,
        };
    }


    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const tryName = SpecialSymbols.TryCatchFinallyBlock;
        const symbol = this.declareSymbol<TrySymbol>(tryName, Keywords.Try, parentScope);
        return symbol;
    }


    protected _collectDeclarations(childrenSymbols: Symbol[], currentScope: TNullable<Scope>): SymbolOrSymbolArray {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as TryScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Parameter: {
                    scope.addParameter(child as ParameterSymbol);
                }
                    break;
                case Keywords.Block: {
                    switch (child.name) {
                        case SpecialSymbols.Try: {
                            scope.setBody(child as BlockSymbol);
                        }
                            break;
                        case SpecialSymbols.Catch: {
                            scope.setCatchBody(child as BlockSymbol);
                        }
                            break;
                        case SpecialSymbols.Finally: {
                            scope.setFinallyBody(child as BlockSymbol);
                        }
                            break;
                    }
                }
                    break;
            }
        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.TryCatchFinallyStatement, TryCatchFinallyStatementHandler);
