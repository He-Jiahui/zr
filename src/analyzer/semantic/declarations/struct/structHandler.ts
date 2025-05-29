import {Handler} from "../../common/handler";
import {StructDeclaration} from "../../../../parser/generated/parser";
import {StructMethodType} from "./methodHandler";
import {StructFieldType} from "./fieldHandler";
import {StructMetaFunctionType} from "./metaFunctionHandler";
import type {IdentifierType} from "../identifierHandler";
import {StructSymbol} from "../../../static/symbol/structSymbol";
import {StructScope} from "../../../static/scope/structScope";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {Scope} from "../../../static/scope/scope";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";

export type StructType = {
    type: "Struct";
    name: IdentifierType;
    fields: StructFieldType[];
    methods: StructMethodType[];
    metaFunctions: StructMetaFunctionType[];
}

export class StructDeclarationHandler extends Handler {
    public value: StructType;
    public readonly membersHandler: Handler[] = [];
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            ...this.membersHandler
        ];
    }

    public _handle(node: StructDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        const fields: StructFieldType[] = [];
        const methods: StructMethodType[] = [];
        const metaFunctions: StructMetaFunctionType[] = [];
        for (const member of members) {
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (StructFieldType | StructMethodType | StructMetaFunctionType);
            if (!value) {
                continue;
            }
            switch (value.type) {
                case "StructField": {
                    fields.push(value);
                }
                    break;
                case "StructMethod": {
                    methods.push(value);
                }
                    break;
                case "StructMetaFunction": {
                    metaFunctions.push(value);
                }
                    break;
            }
        }
        this.value = {
            type: "Struct",
            name: this.nameHandler?.value,
            fields,
            methods,
            metaFunctions
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const structName: string = this.value.name.name;
        const symbol = this.declareSymbol<StructSymbol>(structName, "Struct", parentScope);
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as StructScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case "field": {
                    scope.addField(child as FieldSymbol);
                }
                    break;
                case "function": {
                    scope.addMethod(child as FunctionSymbol);
                }
                    break;
                case "meta": {
                    scope.addMetaFunction(child as MetaSymbol);
                }
                    break;
            }
        }

        return scope.ownerSymbol;
    }
}

Handler.registerHandler("StructDeclaration", StructDeclarationHandler);
