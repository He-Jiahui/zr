import type {StatementType} from "."
import {Block} from "../../../parser/generated/parser";
import {Handler} from "../common/handler"
import {Symbol} from "../../static/symbol/symbol";
import {BlockSymbol} from "../../static/symbol/blockSymbol";
import {BlockScope} from "../../static/scope/blockScope";

export type BlockType = {
    type: "Block",
    isStatement: boolean,
    body: StatementType[]
}

export class BlockHandler extends Handler {
    private readonly bodyHandler: Handler[] = [];

    public value: BlockType;

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

    protected _collectDeclarations(): Symbol | undefined {
        const symbol = this.context.declare<BlockSymbol>("", "Block");
        const scope = this.pushScope<BlockScope>("Block");
        symbol.body = scope;
        scope.info = symbol;

        for (const statement of this.value.body) {
            const handler = Handler.getHandler(statement);
            const sym = handler?.collectDeclarations();
            // collect variables
            if (sym) {
                if (statement.type === "VariableDeclaration") {
                    scope.addVariable(handler?.collectDeclarations());
                } else {
                    scope.addSubScope(handler?.collectDeclarations());
                }
            }
        }
        this.popScope();
        return symbol;
    }
}

Handler.registerHandler("Block", BlockHandler);