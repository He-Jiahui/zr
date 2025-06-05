import {ModuleDeclaration} from "../../parser/generated/parser";
import {Handler} from "./common/handler";
import type {IdentifierType} from "./declarations/identifierHandler";
import type {StringType} from "./literals/stringHandler";
import {TNullable} from "../utils/zrCompilerTypes";
import {Keywords} from "../../types/keywords";

export type ModuleDeclarationType = {
    type: Keywords.ModuleDeclaration,
    name: StringType | IdentifierType
}

export class ModuleDeclarationHandler extends Handler {
    public value: ModuleDeclarationType;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler
        ];
    }

    public _handle(node: ModuleDeclaration) {
        super._handle(node);
        const name = node.name;

        this.nameHandler = Handler.handle(name, this.context);

        this.value = {
            type: Keywords.ModuleDeclaration,
            name: this.nameHandler?.value,
        }
    }
}

Handler.registerHandler(Keywords.ModuleDeclaration, ModuleDeclarationHandler);
