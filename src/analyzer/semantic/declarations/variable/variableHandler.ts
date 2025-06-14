import {VariableDeclaration} from "../../../../parser/generated/parser";
import {Symbol, Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {VariableSymbol} from "../../../static/symbol/variableSymbol";
import {Handler} from "../../common/handler";

import type {AllType} from "../../types/types";
import type {IdentifierType} from "../identifierHandler";
import type {DestructuringArrayType, DestructuringObjectType} from "./destructuringHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Scope} from "../../../static/scope/scope";
import {Keywords} from "../../../../types/keywords";
import type {ExpressionType} from "../../expressions/types";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type VariableType = {
    type: Keywords.VariableDeclaration,
    pattern: IdentifierType | DestructuringArrayType | DestructuringObjectType;
    value: ExpressionType;
    typeInfo: AllType;
}

export class VariableHandler extends Handler {
    public value: VariableType;

    private patternHandler: TNullable<Handler> = null;
    private valueHandler: TNullable<Handler> = null;
    private typeHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.patternHandler,
            this.valueHandler,
            this.typeHandler
        ];
    }

    public _handle(node: VariableDeclaration): void {
        this.patternHandler = Handler.handle(node.pattern, this.context);
        this.valueHandler = Handler.handle(node.value, this.context);
        if (node.typeInfo) {
            this.typeHandler = Handler.handle(node.typeInfo, this.context);
        } else {
            this.typeHandler = null;
        }

        this.value = {
            type: Keywords.VariableDeclaration,
            pattern: this.patternHandler?.value,
            value: this.valueHandler?.value,
            typeInfo: this.typeHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        const getDeclaration = (identifier: IdentifierType) => {
            const symbol = this.declareSymbol<VariableSymbol>(identifier.name, Keywords.Variable, parentScope);
            return symbol;
        };
        const collect = () => {
            switch (this.value.pattern.type) {
                case Keywords.Identifier: {
                    const symbol = getDeclaration(this.value.pattern);
                    if (symbol) {
                        symbol.typePlaceholder = TypePlaceholder.create(this.value.typeInfo, this);
                    }
                    return symbol;
                }
                case Keywords.DestructuringArray: {
                    return this.value.pattern.keys.map(key => {
                        return getDeclaration(key);
                    });
                }
                case Keywords.DestructuringObject: {
                    return this.value.pattern.keys.map(key => {
                        return getDeclaration(key);
                    });
                }
            }
            return null;
        };
        const declaration = collect();
        if (declaration instanceof Array) {
            const symbol = this.declareSymbol<VariableSymbol>("", Keywords.Variable, parentScope);
            if (!symbol) {
                return null;
            }
            for (const d of declaration) {
                if (!d) {
                    continue;
                }
                symbol.subSymbols.push(d);
            }
            return symbol;
        }
        return declaration;
    }

    protected _collectDeclarations(childrenSymbols: Symbol[], currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        return currentScope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.VariableDeclaration, VariableHandler);
