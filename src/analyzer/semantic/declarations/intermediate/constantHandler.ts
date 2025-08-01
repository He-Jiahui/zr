import {Keywords} from "../../../../types/keywords";
import {IdentifierType} from "../identifierHandler";
import {LiteralType} from "../../literals/types";
import {Handler} from "../../common/handler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {IntermediateConstant} from "../../../../parser/generated/parser";
import {Scope} from "../../../static/scope/scope";
import {Symbol} from "../../../static/symbol/symbol";
import {VariableSymbol} from "../../../static/symbol/variableSymbol";
import {ZrIntermediateType} from "../../../../generator/instruction/literals";

export type ConstantType = {
    type: Keywords.Constant,
    name: IdentifierType,
    value: LiteralType
};

export class ConstantHandler extends Handler {
    public value: ConstantType;
    private nameHandler: TNullable<Handler> = null;
    private valueHandler: TNullable<Handler> = null;

    protected get _children(): Array<TNullable<Handler>> {
        return [this.nameHandler, this.valueHandler];
    }

    protected _handle(node: IntermediateConstant) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        this.value = {
            type: Keywords.Constant,
            name: this.nameHandler?.value,
            value: this.valueHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const symbol = this.declareSymbol<VariableSymbol>(this.value.name.name, Keywords.Variable, parentScope);
        if (symbol) {
            symbol.invariant = Keywords.Constant;
            const value = this.value.value;
            const type = value.type;
            switch (type) {
                case Keywords.StringLiteral:
                    symbol.basicType = ZrIntermediateType.String;
                    break;
                case Keywords.IntegerLiteral:
                    symbol.basicType = ZrIntermediateType.Int64;
                    break;
                case Keywords.FloatLiteral:
                    symbol.basicType = ZrIntermediateType.Float;
                    break;
                case Keywords.BooleanLiteral:
                    symbol.basicType = ZrIntermediateType.Bool;
                    break;
                case Keywords.NullLiteral:
                    symbol.basicType = ZrIntermediateType.Null;
                    break;
                case Keywords.CharLiteral:
                    symbol.basicType = ZrIntermediateType.Int64;
                    break;
                default:
                    symbol.basicType = ZrIntermediateType.Unknown;
                    throw new Error(`Unexpected value type: ${type}`);
            }
            symbol.defaultValue = value.value;
        }
        return symbol;
    }
}

Handler.registerHandler(Keywords.IntermediateConstant, ConstantHandler);
