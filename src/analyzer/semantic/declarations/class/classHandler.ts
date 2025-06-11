import {Handler} from "../../common/handler";
import {ClassDeclaration} from "../../../../parser/generated/parser";
import type {ClassFieldType} from "./fieldHandler";
import type {ClassPropertyType} from "./propertyHandler";
import type {ClassMethodType} from "./methodHandler";
import type {ClassMetaFunctionType} from "./metaFunctionHandler";
import type {IdentifierType} from "../identifierHandler";
import type {DecoratorExpressionType} from "../../expressions/decoratorHandler";
import type {GenericDeclarationType} from "../../types/genericDeclarationHandler";
import type {ClassSymbol} from "../../../static/symbol/classSymbol";
import type {ClassScope} from "../../../static/scope/classScope";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {GenericSymbol} from "../../../static/symbol/genericSymbol";
import {Scope} from "../../../static/scope/scope";
import {FieldSymbol} from "../../../static/symbol/fieldSymbol";
import {FunctionSymbol} from "../../../static/symbol/functionSymbol";
import {MetaSymbol} from "../../../static/symbol/metaSymbol";
import {PropertySymbol} from "../../../static/symbol/propertySymbol";
import {Keywords} from "../../../../types/keywords";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";
import type {AllType} from "../../types/types";
import {TypeInferContext} from "../../../static/type/typeInferContext";
import {ClassMetaType} from "../../../static/type/meta/classMetaType";
import {InterfaceMetaType} from "../../../static/type/meta/interfaceMetaType";
import {ZrInternalError} from "../../../../errors/zrInternalError";

export type ClassType = {
    type: Keywords.Class;
    name: IdentifierType;
    inherits: AllType[];
    decorators: DecoratorExpressionType[];
    generic: GenericDeclarationType;
    fields: ClassFieldType[];
    properties: ClassPropertyType[];
    methods: ClassMethodType[];
    metaFunctions: ClassMetaFunctionType[];
}

export class ClassDeclarationHandler extends Handler {
    public value: ClassType;
    public readonly membersHandler: Handler[] = [];
    public readonly inheritsHandler: Handler[] = [];
    public readonly decoratorsHandler: Handler[] = [];
    public genericHandler: TNullable<Handler> = null;
    private nameHandler: TNullable<Handler> = null;

    protected get _children() {
        return [
            this.nameHandler,
            ...this.inheritsHandler,
            ...this.decoratorsHandler,
            ...this.membersHandler
        ];
    }

    public _handle(node: ClassDeclaration) {
        super._handle(node);
        const members = node.members;
        this.membersHandler.length = 0;
        this.inheritsHandler.length = 0;
        this.decoratorsHandler.length = 0;
        this.nameHandler = Handler.handle(node.name, this.context);
        if (node.inherits) {
            for (const inherit of node.inherits) {
                const handler = Handler.handle(inherit, this.context);
                this.inheritsHandler.push(handler);
            }
        }
        if (node.decorator) {
            for (const decorator of node.decorator) {
                const handler = Handler.handle(decorator, this.context);
                this.decoratorsHandler.push(handler);
            }
        }
        if (node.generic) {
            this.genericHandler = Handler.handle(node.generic, this.context);
        } else {
            this.genericHandler = null;
        }

        const fields: ClassFieldType[] = [];
        const methods: ClassMethodType[] = [];
        const metaFunctions: ClassMetaFunctionType[] = [];
        const properties: ClassPropertyType[] = [];
        for (const member of members) {
            const handler = Handler.handle(member, this.context);
            this.membersHandler.push(handler);
            const value = handler?.value as (ClassFieldType | ClassMethodType | ClassMetaFunctionType | ClassPropertyType);
            if (!value) {
                continue;
            }
            switch (value.type) {
                case Keywords.ClassField: {
                    fields.push(value);
                }
                    break;
                case Keywords.ClassMethod: {
                    methods.push(value);
                }
                    break;
                case Keywords.ClassMetaFunction: {
                    metaFunctions.push(value);
                }
                    break;
                case Keywords.ClassProperty: {
                    properties.push(value);
                }
                    break;
            }
        }
        this.value = {
            type: Keywords.Class,
            name: this.nameHandler?.value,
            inherits: this.inheritsHandler.map(handler => handler?.value),
            decorators: this.decoratorsHandler.map(handler => handler?.value),
            generic: this.genericHandler?.value,
            fields,
            methods,
            metaFunctions,
            properties
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>) {
        const className: string = this.value.name.name;
        const symbol = this.declareSymbol<ClassSymbol>(className, Keywords.Class, parentScope);
        // we can not decide super class
        if (symbol) {
            symbol.inheritsFrom.length = 0;
            // add inherits
            for (const inherit of this.value.inherits) {
                // process each inherit
                symbol.inheritsFrom.push(TypePlaceholder.create(inherit, this));
            }
        }

        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }
        const scope = currentScope as ClassScope;

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
                case Keywords.Property: {
                    scope.addProperty(child as PropertySymbol);
                }
                    break;
            }
        }
        return currentScope.ownerSymbol;

    }

    protected _inferTypeBack(childrenContexts: TypeInferContext[], currentInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        const symbol = this.symbol as ClassSymbol;
        if (!symbol) {
            return null;
        }

        let baseClass: TNullable<ClassMetaType> = null;
        const interfaces: InterfaceMetaType[] = symbol.interfaces;
        interfaces.length = 0;
        for (const inherit of symbol.inheritsFrom) {
            const reference = inherit.toTypeReference;
            if (!reference) {
                new ZrInternalError(`Can not resolve inherit type ${inherit}`, this.context).report();
                continue;
            }
            if (reference.targetType instanceof ClassMetaType) {
                // todo
                if (baseClass) {
                    new ZrInternalError(`Class ${symbol.name} can not inherit from multiple classes`, this.context).report();
                    continue;
                }
                baseClass = reference.targetType;
            }

            if (reference.targetType instanceof InterfaceMetaType) {
                interfaces.push(reference.targetType);
            }
            // todo
            new ZrInternalError(`Class ${symbol.name} can not inherit from ${reference.targetType.name}`, this.context).report();
        }
        symbol.baseClass = baseClass;
        return null;
    }
}

Handler.registerHandler(Keywords.ClassDeclaration, ClassDeclarationHandler);
