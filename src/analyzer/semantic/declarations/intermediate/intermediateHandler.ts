import {Keywords} from "../../../../types/keywords";
import {IdentifierType} from "../identifierHandler";
import {AllType} from "../../types/types";
import {ParameterType} from "../../types/parameterHandler";
import {Handler} from "../../common/handler";
import {TNullable} from "../../../utils/zrCompilerTypes";
import {IntermediateStatement} from "../../../../parser/generated/parser";
import {Scope} from "../../../static/scope/scope";
import {Symbol as SymbolDeclaration} from "../../../static/symbol/symbol";
import {ConstantType} from "./constantHandler";
import {InstructionType} from "./instructionHandler";
import {IntermediateSymbol} from "../../../static/symbol/intermediateSymbol";
import {TypePlaceholder} from "../../../static/type/typePlaceholder";
import {IntermediateScope} from "../../../static/scope/intermediateScope";
import {VariableSymbol} from "../../../static/symbol/variableSymbol";
import {ParameterSymbol} from "../../../static/symbol/parameterSymbol";
import {ZrIntermediateWritable} from "../../../../generator/writable/writable";
import {ZrIntermediateFunction} from "../../../../generator/writable/function";
import {ZrIntermediateDeclareType, ZrIntermediateModule} from "../../../../generator/writable/module";
import {ZrIntermediateConstantValue} from "../../../../generator/writable/constantValue";
import {ZrIntermediateLocalVariable} from "../../../../generator/writable/localVariable";

export type IntermediateType = {
    type: Keywords.Intermediate,
    name: IdentifierType,
    returnType: AllType,
    parameters: IdentifierType[],
    args: ParameterType,
    closures: IdentifierType[],
    constants: ConstantType[],
    locals: IdentifierType[],
    instructions: InstructionType[],
}

export class IntermediateHandler extends Handler {
    public value: IntermediateType;
    private nameHandler: TNullable<Handler> = null;
    private returnTypeHandler: TNullable<Handler> = null;
    private readonly parameterHandlers: Handler[] = [];
    private argsHandler: TNullable<Handler> = null;
    private readonly closureHandlers: Handler[] = [];
    private readonly constantHandlers: Handler[] = [];
    private readonly localHandlers: Handler[] = [];
    private readonly instructionHandlers: Handler[] = [];

    protected get _children(): Array<TNullable<Handler>> {
        return [
            this.nameHandler,
            this.returnTypeHandler,
            ...this.parameterHandlers,
            this.argsHandler,
            ...this.closureHandlers,
            ...this.constantHandlers,
            ...this.localHandlers,
            ...this.instructionHandlers
        ];
    }

    protected _handle(node: IntermediateStatement) {
        super._handle(node);
        const declaration = node.declaration;
        this.nameHandler = Handler.handle(declaration.name, this.context);
        if (declaration.returnPart) {
            this.returnTypeHandler = Handler.handle(declaration.returnPart, this.context);
        } else {
            this.returnTypeHandler = null;
        }
        this.parameterHandlers.length = 0;
        if (declaration.params) {
            for (const param of declaration.params) {
                const handler = Handler.handle(param, this.context);
                handler.signByParentHandler(Keywords.Parameter);
                this.parameterHandlers.push(handler);
            }
        }

        if (declaration.args) {
            this.argsHandler = Handler.handle(declaration.args, this.context);
        } else {
            this.argsHandler = null;
        }
        this.closureHandlers.length = 0;
        if (declaration.closures) {
            for (const closure of declaration.closures) {
                const handler = Handler.handle(closure, this.context);
                handler.signByParentHandler(Keywords.Closure);
                this.closureHandlers.push(handler);
            }
        }
        this.constantHandlers.length = 0;
        if (declaration.constants) {
            for (const constant of declaration.constants) {
                const handler = Handler.handle(constant, this.context);
                handler.signByParentHandler(Keywords.Constant);
                this.constantHandlers.push(handler);
            }
        }
        this.localHandlers.length = 0;
        if (declaration.locals) {
            for (const local of declaration.locals) {
                const handler = Handler.handle(local, this.context);
                handler.signByParentHandler(Keywords.Local);
                this.localHandlers.push(handler);
            }
        }
        this.instructionHandlers.length = 0;
        if (node.instructions) {
            for (const instruction of node.instructions) {
                const handler = Handler.handle(instruction, this.context);
                handler.signByParentHandler(Keywords.Instruction);
                this.instructionHandlers.push(handler);
            }
        }
        this.value = {
            type: Keywords.Intermediate,
            name: this.nameHandler?.value,
            returnType: this.returnTypeHandler?.value,
            parameters: this.parameterHandlers.map(handler => handler?.value),
            args: this.argsHandler?.value,
            closures: this.closureHandlers.map(handler => handler?.value),
            constants: this.constantHandlers.map(handler => handler?.value),
            locals: this.localHandlers.map(handler => handler?.value),
            instructions: this.instructionHandlers.map(handler => handler?.value)
        };
    }

    protected _createSymbolAndScope(parentScope: TNullable<Scope>) {
        const name = this.value.name.name;
        const symbol = this.declareSymbol<IntermediateSymbol>(name, Keywords.Intermediate, parentScope);
        if (!symbol) {
            return null;
        }
        symbol.returnType = TypePlaceholder.create(this.value.returnType, this);
        // const symbol = this.declareSymbol<Handler>(this.nameHandler?.value.name, Keywords.Intermediate, parentScope);
        // return symbol;
        return symbol;
    }

    protected _collectDeclarations(childrenSymbols: Array<SymbolDeclaration>, currentScope: TNullable<Scope>) {
        if (!currentScope) {
            return null;
        }

        const scope = currentScope as IntermediateScope;
        for (const child of childrenSymbols) {
            const childParameter = child as ParameterSymbol;
            switch (childParameter.invariant) {
                case Keywords.Parameter: {
                    scope.addParameter(child as ParameterSymbol);
                }
                    break;
                case Keywords.Constant: {
                    scope.addConstant(child as VariableSymbol);
                }
                    break;
                case Keywords.Local: {
                    scope.addLocal(child as ParameterSymbol);
                }
                    break;
                case Keywords.Closure: {
                    scope.addClosure(child as ParameterSymbol);
                }
                    break;
                case Keywords.Variable: {
                    scope.addVariable(child as VariableSymbol);
                }
                    break;
                default:
                    break;
            }
        }
        return scope.ownerSymbol;
    }


    protected _generateWritable(parent: TNullable<ZrIntermediateWritable>): TNullable<ZrIntermediateWritable> {
        const writable = new ZrIntermediateFunction();
        const symbol = this.symbol;
        if (symbol === null) {
            return null;
        }
        const scope = this.scope as IntermediateScope;
        if (scope === null) {
            return null;
        }

        writable.name = symbol.name || "";
        const location = symbol.location;
        if (location) {
            writable.startLine = location.start.line;
            writable.endLine = location.end.line;
        }

        const parameters = scope.getParameters();
        for (const constant of scope.getConstants()) {
            const constantWritable = new ZrIntermediateConstantValue();
            constantWritable.type = constant.basicType;
            constantWritable.data = constant.defaultValue;
            const location = constant.location;
            if (location) {
                constantWritable.startLine = location.start.line;
                constantWritable.endLine = location.end.line;
            }
        }

        for (const local of scope.getLocals()) {
            const localWritable = new ZrIntermediateLocalVariable();

        }
        writable.parameterLength = parameters.length;
        // todo:
        writable.hasVarArgs = 0;
        // todo
        if (parent && parent instanceof ZrIntermediateModule) {
            parent.addDeclare(ZrIntermediateDeclareType.Function, writable);
        }
        return writable;
    }
}

Handler.registerHandler(Keywords.IntermediateStatement, IntermediateHandler);
