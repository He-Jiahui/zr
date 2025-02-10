import type { StatementType } from "."
import { Block } from "../../../parser/generated/parser";
import { Handler } from "../common/handler"

export type BlockType = {
    type: "Block",
    body: StatementType[]
}

export class BlockHandler extends Handler{
    private readonly bodyHandler: Handler[] = [];

    public value: BlockType;

    public handle(node: Block): void {
        super.handle(node);
        this.bodyHandler.length = 0;
        for(const statement of node.body){
            const handler = Handler.handle(statement, this.context);
            this.bodyHandler.push(handler);
        }
        this.value = {
            type: "Block",
            body: this.bodyHandler.map(handler => handler?.value as StatementType)
        }
    }
}

Handler.registerHandler("Block", BlockHandler);