import { ModuleDeclaration } from "../../parser/generated/parser";
import { Handler } from "./common/handler";
import type { IdentifierType } from "./declarations/identifierHandler";
import type { StringType } from "./literals/stringHandler";
export type ModuleDeclarationType = {
    type: "ModuleDeclaration",
    name: StringType | IdentifierType
}
export class ModuleDeclarationHandler extends Handler{
    public value: ModuleDeclarationType;
    private nameHandler: Handler | null = null;
    public _handle(node: ModuleDeclaration){
        super._handle(node);
        const name = node.name;

        this.nameHandler = Handler.handle(name, this.context);
        
        this.value = {
            type: "ModuleDeclaration",
            name: this.nameHandler?.value,
        }
    }
}

Handler.registerHandler("ModuleDeclaration", ModuleDeclarationHandler);