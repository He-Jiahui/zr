import type {StatementType} from "."
import {Block} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import type {BlockSymbol} from "../../static/symbol/blockSymbol";
import {BlockScope} from "../../static/scope/blockScope";
import {Symbol as SymbolDeclaration} from "../../static/symbol/symbol";
import type {VariableSymbol} from "../../static/symbol/variableSymbol";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Scope} from "../../static/scope/scope";

export type BlockType = {
    type: "Block",
    isStatement: boolean,
    body: StatementType[]
}

export class BlockHandler extends Handler {
    public value: BlockType;
    private readonly bodyHandler: Handler[] = [];

    protected get _children() {
        return [
            ...this.bodyHandler
        ];
    }

    public _handle(node: Block): void {
        super._handle(node);
        this.bodyHandler.length = 0;
        for (const statement of node.body) {
            const handler = Handler.handle(statement, this.context);
            this.bodyHandler.push(handler);
        }
        this.value = {
            type: "Block",
            isStatement: node.isStatement,
            body: this.bodyHandler.map(handler => handler?.value as StatementType)
        }
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        return this.declareSymbol<BlockSymbol>("$Block", "Block", parentScope);
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as BlockScope;
        for (const child of childrenSymbols) {
            // collect variables
            if (child.type === "variable") {
                scope.addVariable(child as VariableSymbol);
            } else {
                scope.addSubScope(child);
            }

        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler("Block", BlockHandler);
