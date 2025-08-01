export type IntermediateHeadType = [string, IntermediateValueType, any?]
    | [string, IntermediateValueType.Writable, boolean?]
    | [string, IntermediateValueType.Binary, number?];

export const enum IntermediateValueType {
    Writable = 0,
    Null,
    String,
    Bool,
    Int8,
    Int16,
    Int32,
    Int64,
    UInt8,
    UInt16,
    UInt32,
    UInt64,
    Float,
    Double,
    Binary,
    Empty

}
