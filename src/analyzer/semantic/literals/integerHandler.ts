import {Handler} from "../common/handler";
import {DECIMAL} from "../../../parser/generated/parser";
import {Keywords, TypeKeywords} from "../../../types/keywords";
import {TMaybeArray, TNullable} from "../../utils/zrCompilerTypes";
import {TypeInferContext} from "../../static/type/typeInferContext";
import {TypeAssignContext} from "../../static/type/typeAssignContext";
import {TypeReference} from "../../static/type/typeReference";
import {PredefinedType} from "../../static/type/predefined/predefinedType";
import {ZrInternalError} from "../../../errors/zrInternalError";

export type IntegerType = {
    type: Keywords.IntegerLiteral,
    value: bigint,
    literal: string,
    buffer: TNullable<Buffer>,
    typeInfo: TNullable<IntegerTypeInfo>
};

type IntegerTypeInfo = { isUnsigned: boolean; bitSize: 8 | 16 | 32 | 64; };

export class IntegerHandler extends Handler {
    public value: IntegerType;
    private integerType: TypeKeywords;

    public _handle(node: DECIMAL) {
        super._handle(node);

        const bigIntValue = this.parseBigInt(node.literal);
        const integerType = this.determineIntegerType(bigIntValue);
        if (!integerType) {
            new ZrInternalError(`integerOverflow: ${node.literal} is not a valid safe integer`, this.context).report();
        }
        const integerBuffer = this.getIntegerBuffer(bigIntValue, integerType);

        if (integerType) {
            if (integerType.isUnsigned) {
                switch (integerType.bitSize) {
                    case 8: {
                        this.integerType = TypeKeywords.UInt8;
                    }
                        break;
                    case 16: {
                        this.integerType = TypeKeywords.UInt16;
                    }
                        break;
                    case 32: {
                        this.integerType = TypeKeywords.UInt32;
                    }
                        break;
                    case 64: {
                        this.integerType = TypeKeywords.UInt64;
                    }
                        break;
                }
            } else {
                switch (integerType.bitSize) {
                    case 8: {
                        this.integerType = TypeKeywords.Int8;
                    }
                        break;
                    case 16: {
                        this.integerType = TypeKeywords.Int16;
                    }
                        break;
                    case 32: {
                        this.integerType = TypeKeywords.Int32;
                    }
                        break;
                    case 64: {
                        this.integerType = TypeKeywords.Int64;
                    }
                        break;
                }
            }
        } else {
            this.integerType = TypeKeywords.UInt64;
        }

        this.value = {
            type: Keywords.IntegerLiteral,
            value: bigIntValue,
            literal: node.literal,
            buffer: integerBuffer,
            typeInfo: integerType
        };
    }

    protected _inferType(upperTypeInferContext: TNullable<TypeInferContext>): TNullable<TypeInferContext> {
        // todo maybe another int
        return TypeInferContext.createPredefinedTypeContext(this.integerType);
    }

    protected _assignType(childrenContexts: TypeAssignContext[]): TNullable<TMaybeArray<TypeAssignContext>> {
        // todo maybe another int
        return TypeAssignContext.create(TypeReference.createReference(PredefinedType.getPredefinedType(this.integerType)!), this);
    }

    private parseBigInt(literal: string): bigint {
        let bigIntValue: bigint;
        literal = literal.toLowerCase();

        if (literal.startsWith("0x")) {
            bigIntValue = BigInt(literal); // 十六进制直接解析
        } else if (literal.startsWith("0o")) {
            bigIntValue = BigInt(literal); // 八进制直接解析
        } else if (literal.startsWith("0") && literal.length > 1) {
            // 兼容旧版八进制（0开头）
            bigIntValue = BigInt("0o" + literal.slice(1)); // 转为标准八进制格式
        } else {
            bigIntValue = BigInt(literal); // 十进制
        }
        return bigIntValue;
    }

    private determineIntegerType(num: bigint): TNullable<IntegerTypeInfo> {
        const isNegative = num < 0n;

        // 定义类型范围常量
        const ranges = {
            int8: {min: -0x80n, max: 0x7Fn},
            int16: {min: -0x8000n, max: 0x7FFn},
            int32: {min: -0x80000000n, max: 0x7FFFFFFFn},
            int64: {min: -0x8000000000000000n, max: 0x7FFFFFFFFFFFFFFFn},
            uint8: {max: 0xFFn},
            uint16: {max: 0xFFFFn},
            uint32: {max: 0xFFFFFFFFn},
            uint64: {max: 0xFFFFFFFFFFFFFFFFn}
        };

        // 有符号数值处理
        if (isNegative) {
            if (num >= ranges.int8.min && num <= ranges.int8.max) {
                return {isUnsigned: false, bitSize: 8};
            }
            if (num >= ranges.int16.min && num <= ranges.int16.max) {
                return {isUnsigned: false, bitSize: 16};
            }
            if (num >= ranges.int32.min && num <= ranges.int32.max) {
                return {isUnsigned: false, bitSize: 32};
            }
            if (num >= ranges.int64.min && num <= ranges.int64.max) {
                return {isUnsigned: false, bitSize: 64};
            }
            return null; // 超出int64范围
        }

        // 无符号数值处理
        if (num <= ranges.uint8.max) {
            return {
                isUnsigned: num > ranges.int8.max,
                bitSize: 8
            };
        }
        if (num <= ranges.uint16.max) {
            return {
                isUnsigned: num > ranges.int16.max,
                bitSize: 16
            };
        }
        if (num <= ranges.uint32.max) {
            return {
                isUnsigned: num > ranges.int32.max,
                bitSize: 32
            };
        }
        if (num <= ranges.uint64.max) {
            return {
                isUnsigned: num > ranges.int64.max,
                bitSize: 64
            };
        }

        return null; // 超出uint64范围
    }

    private getIntegerBuffer(num: bigint, typeInfo: TNullable<IntegerTypeInfo>): TNullable<Buffer> {
        if (!typeInfo) return null; // 超出 int64/uint64 范围

        const {bitSize} = typeInfo;
        const byteLength = bitSize / 8;
        const buffer = Buffer.alloc(byteLength);

        const isNegative = num < 0n;
        let value = isNegative ? -num : num;

        for (let i = 0; i < byteLength; i++) {
            buffer[i] = Number(value & 0xffn);
            value >>= 8n;
        }

        if (isNegative) {
            let carry = 1;
            for (let i = 0; i < byteLength; i++) {
                const inv = (~buffer[i]) & 0xff;
                buffer[i] = carry ? inv + 1 : inv;
                carry = carry & (inv === 0xff ? 1 : 0);
            }
        }

        return buffer;
    }
}

Handler.registerHandler(Keywords.Integer, IntegerHandler);
