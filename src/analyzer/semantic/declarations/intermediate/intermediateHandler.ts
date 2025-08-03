import {Keywords} from "../../../../types/keywords";
import {IdentifierType} from "../identifierHandler";
import {AllType} from "../../types/types";
import {ParameterType} from "../../types/parameterHandler";
import {Handler} from "../../common/handler";
import {TMaybeArray, TNullable} from "../../../utils/zrCompilerTypes";
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
import {ZrInstruction, ZrInstructionContext} from "../../../../generator/instruction/instruction";
import {ZrInstructionParamsFormat, ZrInstructionParamType} from "../../../../generator/instruction/instructions";
import {ZrInternalError} from "../../../../errors/zrInternalError";
import {ZrIntermediateInstruction} from "../../../../generator/writable/instruction";

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

    private readonly instructions: ZrInstruction[] = [];

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
                default:
                    break;
            }
        }
        return scope.ownerSymbol;
    }

    protected _generateInstruction(children: ZrInstructionContext[]): TNullable<TMaybeArray<ZrInstructionContext>> {
        const intermediateInstructions = new ZrInstructionContext();
        intermediateInstructions.merge(...children);

        // variable
        const scope = this.scope as IntermediateScope;


        const instructions = intermediateInstructions.instructions;
        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            const formats = ZrInstructionParamsFormat[instruction.type];
            for (let j = 0; j < formats.length; j++) {
                const format = formats[j];
                if (format === ZrInstructionParamType.None) {
                    continue;
                }
                const op = instruction.op[j];
                if (!op) {
                    new ZrInternalError(`Missing op in instruction ${instruction.type} at index ${j}`, this.context).report();
                    continue;
                }
                if (op.type === Keywords.Identifier) {
                    this._registerAsUsed(op.value as string, scope, i, format);
                }
            }
        }

        // sort locals
        const localSize = this._rearrangeLocals(scope);

        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            const formats = ZrInstructionParamsFormat[instruction.type];
            instruction.finalOp.length = formats.length;
            for (let j = 0; j < formats.length; j++) {
                const format = formats[j];
                if (format === ZrInstructionParamType.None) {
                    instruction.finalOp[j] = 0;
                } else {
                    this._writeBackInstructionOp(instruction, scope, j, format);
                }
            }
        }
        this.instructions.length = 0;
        this.instructions.push(...instructions);
        return intermediateInstructions;
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

        for (let i = 0; i < scope.localStartList.length; i++) {
            const localWritable = new ZrIntermediateLocalVariable();

            localWritable.instructionStart = BigInt(scope.localStartList[i]);
            localWritable.instructionEnd = BigInt(scope.localEndList[i]);
            localWritable.startLine = BigInt(0);
            localWritable.endLine = BigInt(0);
            writable.localVariables.push(localWritable);
        }

        for (const instruction of this.instructions) {
            const instructionWritable = new ZrIntermediateInstruction();
            instructionWritable.type = instruction.type;
            instructionWritable.value = instruction.finalOp;
            writable.instructions.push(instructionWritable);
        }
        writable.parameterLength = parameters.length;
        // todo:
        writable.hasVarArgs = 0;
        // todo
        if (parent && parent instanceof ZrIntermediateModule) {
            parent.addDeclare(ZrIntermediateDeclareType.Function, writable);
            if (symbol.name === "__entry") {
                parent.setEntry(writable);
            }
        }
        return writable;
    }

    private _registerAsUsed(keyword: string, scope: IntermediateScope, index: number, format: ZrInstructionParamType = ZrInstructionParamType.None): boolean {
        if (format === ZrInstructionParamType.None) {
            return false;
        }
        const parameters = scope.getParameters();
        const locals = scope.getLocals();
        const constants = scope.getConstants();
        const closures = scope.getClosures();

        const parameter = parameters.find(parameter => parameter.name === keyword);
        if (parameter && format === ZrInstructionParamType.Variable) {
            parameter.registerInstructionUsage(index);
            return true;
        }
        const local = locals.find(local => local.name === keyword);
        if (local && format === ZrInstructionParamType.Variable) {
            local.registerInstructionUsage(index);
            return true;
        }
        const constant = constants.find(constant => constant.name === keyword);
        if (constant && format === ZrInstructionParamType.Constant) {
            constant.registerInstructionUsage(index);
            return true;
        }
        const closure = closures.find(closure => closure.name === keyword);
        if (closure && format === ZrInstructionParamType.Closure) {
            closure.registerInstructionUsage(index);
            return true;
        }
        new ZrInternalError(`${keyword} is not defined`, this.context).report();
        return false;
    }

    private _rearrangeLocals(scope: IntermediateScope) {
        const maxEndInstructions: number[] = [];
        const minStartInstructions: number[] = [];
        const locals = scope.getLocals();
        for (let i = 0; i < locals.length; i++) {
            const local = locals[i];
            const indexLength = maxEndInstructions.length;
            let createNew = true;
            const instructionStart = local.startInstructionIndex;
            if (instructionStart < 0) {
                // unused parameter
                local.index = -1;
                break;
            }
            for (let j = 0; j < indexLength; j++) {
                const instructionEnd = maxEndInstructions[j];
                if (instructionStart > instructionEnd) {
                    createNew = false;
                    maxEndInstructions[j] = local.endInstructionIndex;
                    local.index = j;
                    break;
                }
            }
            if (createNew) {
                maxEndInstructions.push(local.endInstructionIndex);
                minStartInstructions.push(local.startInstructionIndex);
                local.index = indexLength;
            }
        }
        scope.localStartList.length = 0;
        scope.localEndList.length = 0;
        scope.localStartList.push(...minStartInstructions);
        scope.localEndList.push(...maxEndInstructions);
        return maxEndInstructions.length;
    }

    private _writeBackInstructionOp(instruction: ZrInstruction, scope: IntermediateScope, index: number, format: ZrInstructionParamType = ZrInstructionParamType.None) {
        if (format === ZrInstructionParamType.None) {
            return false;
        }
        const parameters = scope.getParameters();
        const locals = scope.getLocals();
        const constants = scope.getConstants();
        const closures = scope.getClosures();

        const op = instruction.op[index];
        const parameter = parameters.find(parameter => parameter.name === op.value);
        if (parameter && format === ZrInstructionParamType.Variable) {
            instruction.finalOp[index] = parameter.index;
            return true;
        }
        const local = locals.find(local => local.name === op.value);
        if (local && format === ZrInstructionParamType.Variable) {
            // todo: args & parameters is behind locals
            instruction.finalOp[index] = local.index + parameters.length + 1;
            return true;
        }
        const constant = constants.find(constant => constant.name === op.value);
        if (constant && format === ZrInstructionParamType.Constant) {
            instruction.finalOp[index] = constant.index;
            return true;
        }
        const closure = closures.find(closure => closure.name === op.value);
        if (closure && format === ZrInstructionParamType.Closure) {
            instruction.finalOp[index] = closure.index;
            return true;
        }
        return false;
    }
}

Handler.registerHandler(Keywords.IntermediateStatement, IntermediateHandler);
