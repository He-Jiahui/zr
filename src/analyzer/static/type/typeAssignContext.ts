import {TypeReference} from "./typeReference";
import {Handler} from "../../semantic/common/handler";
import {ScriptContext, ScriptContextAccessibleObject} from "../../../common/scriptContext";
import {TNullable} from "../../utils/zrCompilerTypes";
import {TypeKeywords} from "../../../types/keywords";
import {PredefinedType} from "./predefined/predefinedType";
import {ClassMetaType} from "./meta/classMetaType";
import {InterfaceMetaType} from "./meta/interfaceMetaType";
import {InterfaceSymbol} from "../symbol/interfaceSymbol";
import {IntType} from "./predefined/intType";
import {FloatType} from "./predefined/floatType";
import {StringType} from "./predefined/stringType";

export class TypeAssignContext extends ScriptContextAccessibleObject<ScriptContext> {
    typeReference: TNullable<TypeReference> = null;
    leftContext: TNullable<TypeAssignContext> = null;
    rightContext: TNullable<TypeAssignContext> = null;

    byHandler: Handler;

    public static create(originalReference: TNullable<TypeReference>, handler: Handler): TypeAssignContext {
        const context = handler.context;
        const assignContext = new TypeAssignContext(context);
        assignContext.typeReference = originalReference;
        assignContext.byHandler = handler;
        return assignContext;
    }

    public static mergeType(left: TNullable<TypeAssignContext>, right: TNullable<TypeAssignContext>, handler: Handler): TypeAssignContext {
        const context = handler.context;
        if ((!left || !left.typeReference) && (!right || !right.typeReference)) {
            return TypeAssignContext.create(null, handler);
        }
        if (!left || !left.typeReference) {
            const assignContext = TypeAssignContext.create(right?.typeReference ?? null, handler);
            assignContext.leftContext = left;
            assignContext.rightContext = right;
            return assignContext;
        }

        if (!right || !right.typeReference) {
            const assignContext = TypeAssignContext.create(left?.typeReference ?? null, handler);
            assignContext.leftContext = left;
            assignContext.rightContext = right;
            return assignContext;
        }

        const lType = left.typeReference.targetType;
        const rType = right.typeReference.targetType;
        // two types are same
        if (lType === rType) {
            const assignContext = TypeAssignContext.create(left.typeReference, handler);
            assignContext.leftContext = left;
            assignContext.rightContext = right;
            return assignContext;
        }
        // base class conversion
        if ((lType instanceof ClassMetaType || lType instanceof InterfaceMetaType) && (rType instanceof ClassMetaType || lType instanceof InterfaceMetaType)) {
            const lTypeCI = lType as ClassMetaType | InterfaceMetaType;
            const rTypeCI = rType as ClassMetaType | InterfaceMetaType;
            if (lTypeCI.relatedSymbol.isSubClassOf(rTypeCI.relatedSymbol as InterfaceSymbol)) {
                return TypeAssignContext.create(TypeReference.createReference(rType), handler);
            } else if (rTypeCI.relatedSymbol.isSubClassOf(lTypeCI.relatedSymbol as InterfaceSymbol)) {
                return TypeAssignContext.create(TypeReference.createReference(lType), handler);
            }
            // as object
            return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(TypeKeywords.Object)!), handler);
        }

        //

        // basic type conversion
        // lower int/float type to higher
        if (lType instanceof IntType && rType instanceof IntType) {
            return TypeAssignContext.create(lType.compareTo(rType) >= 0 ? left.typeReference : right.typeReference, handler);
        }
        if (lType instanceof FloatType && rType instanceof FloatType) {
            return TypeAssignContext.create(lType.compareTo(rType) >= 0 ? left.typeReference : right.typeReference, handler);
        }
        // int to float
        if (lType instanceof FloatType && rType instanceof IntType) {
            return TypeAssignContext.create(left.typeReference, handler);
        }
        if (rType instanceof FloatType && lType instanceof IntType) {
            return TypeAssignContext.create(right.typeReference, handler);
        }
        // everything to string
        if (lType instanceof StringType) {
            return TypeAssignContext.create(left.typeReference, handler);
        }
        if (rType instanceof StringType) {
            return TypeAssignContext.create(right.typeReference, handler);
        }


        // if we cannot convert, return null
        return TypeAssignContext.create(null, handler);
    }
}
