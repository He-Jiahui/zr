import {
    InterfaceDeclaration,
    InterfaceFieldDeclaration,
    InterfaceMetaSignature,
    InterfaceMethodSignature,
    InterfacePropertySignature
} from "../../../../parser/generated/parser";
import {InterfaceScope} from "../../../static/scope/interfaceScope";
import {InterfaceSymbol} from "../../../static/symbol/interfaceSymbol";
import {Symbol as SymbolDeclaration, Symbol} from "../../../static/symbol/symbol";
import {Handler} from "../../common/handler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {IdentifierType} from "../identifierHandler";
import type {InterfaceFieldDeclarationType} from "./fieldHandler";
import type {InterfaceMethodSignatureType} from "./methodHandler";
import type {InterfacePropertySignatureType} from "./propertyHandler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Scope} from "../../../static/scope/scope";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {PropertySymbol} from "../../../static/symbol/propertySymbol";
import {GenericSymbol} from "../../../static/symbol/genericSymbol";
import {Keywords} from "../../../../types/keywords";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";
import {InterfaceMetaSignatureType} from "./metaFunctionHandler";

export type InterfaceType = {
    type: Keywords.Interface,
    name: IdentifierType,
    metas: InterfaceMetaSignatureType[],
    methods: InterfaceMethodSignatureType[],
    properties: InterfacePropertySignatureType[],
    fields: InterfaceFieldDeclarationType[],
    inherits: IdentifierType[],
    generic: GenericDeclarationType,
}

export class InterfaceDeclarationHandler extends Handler {
    public value: InterfaceType;
    public readonly membersHandler: Handler[] = [];
    public readonly inheritsHandler: Handler[] = [];
    public readonly metasHandler: Handler[] = [];
    public genericHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            ...this.inheritsHandler,
            this.genericHandler,
            ...this.membersHandler
        ];
    }

    public _handle(node: InterfaceDeclaration) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        if (node.inherits) {
            for (const inherit of node.inherits) {
                const handler = Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if (node.generic) {
            this.genericHandler = Handler.handle(node.generic, this.context);
        } else {
            this.genericHandler = null;
        }

        const fields: any[] = [];
        const methods: any[] = [];
        const properties: any[] = [];
        const metas: any[] = [];
        for (const member of members) {
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (InterfaceMethodSignature | InterfacePropertySignature | InterfaceFieldDeclaration | InterfaceMetaSignature);
            if (!value) {
                continue;
            }
            switch (value.type) {
                case Keywords.InterfaceFieldDeclaration: {
                    fields.push(value);
                }
                    break;
                case Keywords.InterfaceMethodSignature: {
                    methods.push(value);
                }
                    break;
                case Keywords.InterfaceMetaSignature: {
                    metas.push(value);
                }
                    break;
                case Keywords.InterfacePropertySignature: {
                    properties.push(value);
                }
                    break;
            }
        }
        this.value = {
            type: Keywords.Interface,
            name: this.nameHandler?.value,
            metas,
            fields,
            methods,
            properties,
            inherits: this.inheritsHandler.map(handler => handler?.value),
            generic: this.genericHandler?.value
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>): TNullable<Symbol> {
        const interfaceName = this.value.name.name;
        return this.declareSymbol<InterfaceSymbol>(interfaceName, Keywords.Interface, parentScope);
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as InterfaceScope;

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
                case Keywords.Meta: {
                    scope.addMetaFunction(child as MetaSymbol);
                }
                    break;
                case Keywords.Function: {
                    scope.addMethod(child as FunctionSymbol);
                }
                    break;
                case Keywords.Property: {
                    scope.addProperty(child as PropertySymbol);
                }
                    break;
            }
        }

        return scope.ownerSymbol;
    }
}

Handler.registerHandler(Keywords.InterfaceDeclaration, InterfaceDeclarationHandler);
