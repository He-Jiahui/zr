import {InterfaceFieldDeclaration} from "../../../../parser/generated/parser";
import {Access} from "../../../../types/access";
import {Handler} from "../../common/handler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Keywords} from "../../../../types/keywords";
import {Scope} from "../../../static/scope/scope";
import {Symbol} from "../../../static/symbol/symbol";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";

export type InterfaceFieldDeclarationType = {
    type: Keywords.InterfaceFieldDeclaration,
    name: IdentifierType,
    targetType: AllType,
    access: Access,
}

export class InterfaceFieldDeclarationHandler extends Handler {
    public value: InterfaceFieldDeclarationType;
    private nameHandler: TNullable<Handler> = null;
    private targetTypeHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.targetTypeHandler
        ];
    }

    public _handle(node: InterfaceFieldDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const access = node.access;
        if (node.targetType) {
            this.targetTypeHandler = Handler.handle(node.targetType, this.context);
        } else {
            this.targetTypeHandler = null;
        }
        this.value = {
            type: Keywords.InterfaceFieldDeclaration,
            name: this.nameHandler?.value,
            access: access as Access,
            targetType: this.targetTypeHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const name = this.value.name.name;
        const symbol = this.declareSymbol<FieldSymbol>(name, Keywords.Field, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.accessibility = this.value.access;
        return symbol;
    }
}

Handler.registerHandler(Keywords.InterfaceFieldDeclaration, InterfaceFieldDeclarationHandler);
