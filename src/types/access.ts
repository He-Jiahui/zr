export enum Access {
    PUBLIC = "pub",
    PRIVATE = "pri",
    PROTECTED = "pro",
}

export enum PropertyType {
    GET = "get",
    SET = "set",
    GET_SET = "get_set",
}

export enum MetaFunctionType {
    CONSTRUCTOR = 1,
    DESTRUCTOR = 2,
    ADD = 3,
    SUB = 4,
    MUL = 5,
    DIV = 6,
    MOD = 7,
    NEG = 8,
    COMPARE = 9,
    TO_BOOL = 10,
    TO_STRING = 11,
    TO_INT = 12,
    TO_FLOAT = 13,
    CALL = 14,
    GETTER = 15,
    SETTER = 16,
    SHIFT_LEFT = 17,
    SHIFT_RIGHT = 18,
    BIT_AND = 19,
    BIT_OR = 20,
    BIT_XOR = 21,
    BIT_NOT = 22,
    CLOSE = 23,

}
