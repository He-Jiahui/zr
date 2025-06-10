import {Type} from "../../../parser/generated/parser";
import {Handler} from "../common/handler";
import type {IdentifierType} from "../declarations/identifierHandler";
import {GenericType} from "./genericHandler";
import {TupleType} from "./tupleHandler";
import {TNullable} from "../../utils/zrCompilerTypes";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TypeInferContext} from "../../static/type/typeInferContext";
import type {Symbol} from "../../static/symbol/symbol";
import {ZrInternalError} from "../../../errors/zrInternalError";
import {TypeReference} from "../../static/type/typeReference";

export type TypeType = {
    type: Keywords.Type,
    name: IdentifierType | GenericType | TupleType,
    subType: TypeType
    dimensions: number
}

export class TypeHandler extends Handler {
    public value: TypeType;
    private nameHandler: TNullable<Handler> = null;
    private subTypeHandler: TNullable<Handler> = null;
    private _typeReference: TNullable<TypeReference> = null;

    public get typeReference() {
        return this._typeReference;
    }

    protected get _children() {
        return [
            this.nameHandler
        ];
    }

    public _handle(node: Type) {
        super._handle(node);
        this.nameHandler = Handler.handle(node.name, this.context);
        if (node.subType) {
            this.subTypeHandler = Handler.handle(node.subType, this.context);
        } else {
            this.subTypeHandler = null;
        }
        this.value = {
            type: Keywords.Type,
            name: this.nameHandler?.value,
            subType: this.subTypeHandler?.value,
            dimensions: node.dimensions
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        const typeName = this.value.name;
        let createdContext: TNullable<TypeInferContext> = null;
        let foundSymbol: TNullable<Symbol> = null;
        switch (typeName.type) {
            case Keywords.Identifier: {
                const identifierName = typeName.name;
                const upperType = upperTypeInferContext?.upperType;
                const inTypeChain = upperTypeInferContext?.inTypeChain;
                if (upperType) {
                    const parentSymbol = upperType.userDeclaredType()?.relatedSymbol ?? null;
                    foundSymbol = parentSymbol?.childScope?.getSymbol(identifierName) ?? null;
                    const symbolType = foundSymbol?.generatedType ?? null;
                    upperTypeInferContext.generateDotType(symbolType);
                    createdContext = upperTypeInferContext;
                } else {
                    foundSymbol = this.findSymbolInScope(identifierName);
                    createdContext = TypeInferContext.createTypeInferContext(foundSymbol);
                }
                if (!foundSymbol && inTypeChain) {
                    // TODO: 错误处理
                    new ZrInternalError(`symbol ${identifierName} not found`, this.context).report();
                    return null;
                }
                // no symbol found, we guess it is a predefined type
                if (!foundSymbol) {
                    createdContext = TypeInferContext.createPredefinedTypeContext(identifierName);
                }
            }
                break;
            case Keywords.Generic: {
                const identifierName = typeName.name.name;

                const upperType = upperTypeInferContext?.upperType;
                const inTypeChain = upperTypeInferContext?.inTypeChain;
                if (upperType) {
                    const parentSymbol = upperType.userDeclaredType()?.relatedSymbol ?? null;
                    foundSymbol = parentSymbol?.childScope?.getSymbol(identifierName) ?? null;
                    const symbolType = foundSymbol?.generatedType ?? null;
                    upperTypeInferContext.generateDotType(symbolType);
                    createdContext = upperTypeInferContext;
                } else {
                    foundSymbol = this.findSymbolInScope(identifierName);
                    createdContext = TypeInferContext.createTypeInferContext(foundSymbol);
                }

                if (!foundSymbol && inTypeChain) {
                    // TODO: 错误处理
                    new ZrInternalError(`symbol ${identifierName} not found`, this.context).report();
                    return null;
                }

                if (foundSymbol && foundSymbol.generatedType && !foundSymbol.generatedType.isGeneric) {
                    // TODO: 错误处理
                    new ZrInternalError(`symbol ${identifierName} is not generic`, this.context).report();
                    return null;
                }

                // no symbol found, we guess it is a predefined type
                if (!foundSymbol) {
                    createdContext = TypeInferContext.createPredefinedTypeContext(identifierName);
                }
                // we will handle generic type on assign step
            }
                break;
            case Keywords.Tuple: {
                // const elements = typeName.elements;
                createdContext = TypeInferContext.createPredefinedTypeContext(TypeKeywords.Array);
                // we will handle generic type on assign step
            }
                break;
        }
        this._typeReference = createdContext?.upperType ?? null;
        if (this.value.dimensions > 0) {
            // convert it as array
            createdContext = TypeInferContext.createPredefinedTypeContext(TypeKeywords.Array);
        }
        if (createdContext) {
            createdContext.inTypeChain = !!(this.value.subType);
        }
        return createdContext;
    }
}

Handler.registerHandler(Keywords.Type, TypeHandler);
