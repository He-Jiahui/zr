import {EnumMember} from "../../../../parser/generated/parser";
import {Symbol} from "../../../static/symbol/symbol";
import {VariableSymbol} from "../../../static/symbol/variableSymbol";
import {Handler} from "../../common/handler";
import type {ExpressionType} from "../../expressions";
import type {IdentifierType} from "../identifierHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Scope} from "../../../static/scope/scope";
import {Keywords} from "../../../../types/keywords";

export type EnumMemberType = {
    type: Keywords.EnumMember,
    name: IdentifierType,
    value: ExpressionType
}

export class EnumMemberHandler extends Handler {
    public value: EnumMemberType;
    private nameHandler: TNullable<Handler> = null;
    private valueHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            this.valueHandler
        ];
    }

    public _handle(node: EnumMember) {
        super._handle(node);
        const name = node.name;
        this.nameHandler = Handler.handle(name, this.context);
        if (node.value) {
            this.valueHandler = Handler.handle(node.value, this.context);
        } else {
            this.valueHandler = null;
        }
        this.value = {
            type: Keywords.EnumMember,
            name: this.nameHandler?.value,
            value: this.valueHandler?.value,
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const name = this.value.name.name;
        const symbol = this.declareSymbol<VariableSymbol>(name, Keywords.Variable, parentScope);
        if (!symbol) {
            return null;
        }
        return symbol;
    }
}

Handler.registerHandler(Keywords.EnumMember, EnumMemberHandler);
