import {EnumDeclaration} from "../../../../parser/generated/parser";
import type {EnumScope} from "../../../static/scope/enumScope";
import type {EnumSymbol} from "../../../static/symbol/enumSymbol";
import {Handler} from "../../common/handler";
import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import type {EnumMemberType} from "./memberHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol, Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {VariableSymbol} from "../../../static/symbol/variableSymbol";
import {Keywords} from "../../../../types/keywords";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type EnumType = {
    type: Keywords.Enum,
    name: IdentifierType,
    members: EnumMemberType[],
    baseType: AllType
}

export class EnumDeclarationHandler extends Handler {
    public value: EnumType;
    private baseTypeHandler: TNullable<Handler> = null;
    private membersHandler: Handler[] = [];
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.baseTypeHandler,
            ...this.membersHandler
        ];
    }

    public _handle(node: EnumDeclaration) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        const members = node.members;
        const baseType = node.baseType;
        if (baseType) {
            this.baseTypeHandler = Handler.handle(baseType, this.context);
        } else {
            this.baseTypeHandler = null;
        }
        this.membersHandler.length = 0;
        for (const member of members) {
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
        }
        this.value = {
            type: Keywords.Enum,
            name: this.nameHandler?.value,
            members: this.membersHandler.map(handler => handler?.value),
            baseType: this.baseTypeHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const enumName = this.value.name.name;
        const symbol = this.declareSymbol<EnumSymbol>(enumName, Keywords.Enum, parentScope);
        if (symbol) {
            symbol.baseType = TypePlaceholder.create(this.value.baseType, this);
        }

        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as EnumScope;
        for (const child of childrenSymbols) {
            scope.addMember(child as VariableSymbol);
        }
        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.EnumDeclaration, EnumDeclarationHandler);
