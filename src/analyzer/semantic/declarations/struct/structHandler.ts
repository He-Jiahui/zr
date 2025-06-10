import {Handler} from "../../common/handler";
import type {StructDeclaration} from "../../../../parser/generated/parser";
import type {StructMethodType} from "./methodHandler";
import type {StructFieldType} from "./fieldHandler";
import type {StructMetaFunctionType} from "./metaFunctionHandler";
import type {IdentifierType} from "../identifierHandler";
import type {StructSymbol} from "../../../static/symbol/structSymbol";
import type {StructScope} from "../../../static/scope/structScope";
import type {TNullable} from "../../../utils/zrCompilerTypes";
import type {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import type {Scope} from "../../../static/scope/scope";
import type {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import type {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import type {MetaSymbol} from "../../../static/symbol/metaSymbol";
import {Keywords} from "../../../../types/keywords";
import type {GenericSymbol} from "../../../static/symbol/genericSymbol";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {AllType} from "../../types/types";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";

export type StructType = {
    type: Keywords.Struct;
    name: IdentifierType;
    generic: GenericDeclarationType;
    fields: StructFieldType[];
    methods: StructMethodType[];
    inherits: AllType[];
    metaFunctions: StructMetaFunctionType[];
}

export class StructDeclarationHandler extends Handler {
    public value: StructType;
    private readonly membersHandler: Handler[] = [];
    private genericHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;
    private readonly inheritsHandler: Handler[] = [];


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

        if (node.generic) {
            this.genericHandler = Handler.handle(node.generic, this.context);
        } else {
            this.genericHandler = null;
        }
        this.inheritsHandler.length = 0;
        for (const inherit of node.inherits) {
            this.inheritsHandler.push(Handler.handle(inherit, this.context));
        }
        for (const member of members) {
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (StructFieldType | StructMethodType | StructMetaFunctionType);
            if (!value) {
                continue;
            }
            switch (value.type) {
                case Keywords.StructField: {
                    fields.push(value);
                }
                    break;
                case Keywords.StructMethod: {
                    methods.push(value);
                }
                    break;
                case Keywords.StructMetaFunction: {
                    metaFunctions.push(value);
                }
                    break;
            }
        }

        this.value = {
            type: Keywords.Struct,
            name: this.nameHandler?.value,
            generic: this.genericHandler?.value,
            inherits: this.inheritsHandler.map(handler => handler.value),
            fields,
            methods,
            metaFunctions
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<SymbolDeclaration> {
        const structName: string = this.value.name.name;
        const symbol = this.declareSymbol<StructSymbol>(structName, Keywords.Struct, parentScope);
        if (symbol) {
            symbol.inheritsFrom.length = 0;
            for (const inherit of this.value.inherits) {
                symbol.inheritsFrom.push(TypePlaceholder.create(inherit, this));
            }
        }
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as StructScope;
        for (const child of childrenSymbols) {
            switch (child.type) {
                case Keywords.Generic: {
                    scope.addGeneric(child as GenericSymbol);
                }
                    break;
                case Keywords.Field: {
                    scope.addField(child as FieldSymbol);
                }
                    break;
                case Keywords.Function: {
                    scope.addMethod(child as FunctionSymbol);
                }
                    break;
                case Keywords.Meta: {
                    scope.addMetaFunction(child as MetaSymbol);
                }
                    break;
            }
        }

        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.StructDeclaration, StructDeclarationHandler);
