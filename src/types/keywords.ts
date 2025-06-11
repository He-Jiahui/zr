export const enum Keywords {
    Script = "Script",
    Module = "Module",
    Class = "Class",
    Interface = "Interface",
    Struct = "Struct",
    Test = "Test",
    Generic = "Generic",
    Field = "Field",
    Function = "Function",
    Meta = "Meta",
    Property = "Property",
    Parameter = "Parameter",
    Block = "Block",
    Enum = "Enum",
    Variable = "Variable",
    Identifier = "Identifier",
    Try = "Try",


    Array = "Array",
    Object = "Object",
    Buffer = "Buffer",

    Boolean = "Boolean",
    Char = "Char",
    Float = "Float",
    Integer = "Integer",
    Null = "Null",
    String = "String",

    Type = "Type",
    GenericType = "GenericType",
    TupleType = "TupleType",

    ArrayLiteral = "ArrayLiteral",
    ObjectLiteral = "ObjectLiteral",
    IdentifierLiteral = "IdentifierLiteral",
    ValueLiteral = "ValueLiteral",
    UnpackLiteral = "UnpackLiteral",

    BooleanLiteral = "BooleanLiteral",
    CharLiteral = "CharLiteral",
    FloatLiteral = "FloatLiteral",
    IntegerLiteral = "IntegerLiteral",
    NullLiteral = "NullLiteral",
    StringLiteral = "StringLiteral",

    Assignment = "Assignment",
    Binary = "Binary",
    Conditional = "Conditional",
    ForLoop = "ForLoop",
    ForeachLoop = "ForeachLoop",
    WhileLoop = "WhileLoop",
    FunctionCall = "FunctionCall",

    Tuple = "Tuple",


    Logical = "Logical",

    KeyValuePair = "KeyValuePair",

    SwitchCase = "SwitchCase",
    SwitchDefault = "SwitchDefault",

    Unary = "Unary",
    UnaryOperator = "UnaryOperator",


    ModuleDeclaration = "ModuleDeclaration",

    ClassDeclaration = "ClassDeclaration",
    ClassField = "ClassField",
    ClassMethod = "ClassMethod",
    ClassProperty = "ClassProperty",
    ClassMetaFunction = "ClassMetaFunction",

    EnumDeclaration = "EnumDeclaration",
    EnumMember = "EnumMember",

    FunctionDeclaration = "FunctionDeclaration",

    InterfaceDeclaration = "InterfaceDeclaration",
    InterfaceFieldDeclaration = "InterfaceFieldDeclaration",
    InterfaceMethodSignature = "InterfaceMethodSignature",
    InterfaceMetaSignature = "InterfaceMetaSignature",
    InterfacePropertySignature = "InterfacePropertySignature",

    StructDeclaration = "StructDeclaration",
    StructField = "StructField",
    StructMethod = "StructMethod",
    StructMetaFunction = "StructMetaFunction",

    TestDeclaration = "TestDeclaration",

    VariableDeclaration = "VariableDeclaration",
    DestructuringObject = "DestructuringObject",
    DestructuringArray = "DestructuringArray",

    GenericDeclaration = "GenericDeclaration",


    ArrayLiteralExpression = "ArrayLiteralExpression",
    AssignmentExpression = "AssignmentExpression",
    BinaryExpression = "BinaryExpression",
    ConditionalExpression = "ConditionalExpression",
    DecoratorExpression = "DecoratorExpression",

    ForLoopExpression = "ForLoopExpression",
    ForeachLoopExpression = "ForeachLoopExpression",
    WhileLoopExpression = "WhileLoopExpression",
    IfExpression = "IfExpression",
    LambdaExpression = "LambdaExpression",

    ValueLiteralExpression = "ValueLiteralExpression",
    IdentifierLiteralExpression = "IdentifierLiteralExpression",

    LogicalExpression = "LogicalExpression",
    MemberExpression = "MemberExpression",
    ObjectLiteralExpression = "ObjectLiteralExpression",
    KeyValuePairExpression = "KeyValuePairExpression",

    PrimaryExpression = "PrimaryExpression",
    SwitchExpression = "SwitchExpression",

    UnaryExpression = "UnaryExpression",
    UnpackLiteralExpression = "UnpackLiteralExpression",

    TryCatchFinallyStatement = "TryCatchFinallyStatement",
    BreakContinueStatement = "BreakContinueStatement",
    OutStatement = "OutStatement",
    ReturnStatement = "ReturnStatement",
    ThrowStatement = "ThrowStatement",

    ExpressionStatement = "ExpressionStatement",

}


export const enum ScopeKeywords {
    ModuleScope = "ModuleScope",
    BlockScope = "BlockScope",
    ClassScope = "ClassScope",
    EnumScope = "EnumScope",
    FunctionScope = "FunctionScope",
    StructScope = "StructScope",
    InterfaceScope = "InterfaceScope",
    PropertyScope = "PropertyScope",
    TestScope = "TestScope",
    TryScope = "TryScope",
}

export const enum TypeKeywords {
    Array = "array",
    Object = "object",
    Buffer = "buffer",
    Function = "function",

    Boolean = "bool",
    Float = "float",
    Integer = "int",
    String = "string",
    Null = "null",


    Double = "double",
    Float32 = "float32",
    Float64 = "float64",

    Char = "char",
    Byte = "byte",
    Short = "short",
    Long = "long",
    UShort = "ushort",
    UInt = "uint",
    ULong = "ulong",
    Int8 = "int8",
    Int16 = "int16",
    Int32 = "int32",
    Int64 = "int64",
    UInt8 = "uint8",
    UInt16 = "uint16",
    UInt32 = "uint32",
    UInt64 = "uint64",

    Void = "void",

    Any = "any",

}

export const enum SpecialSymbols {
    Lambda = "$Lambda",
    Block = "$Block",
    TryCatchFinallyBlock = "$TryCatchFinallyBlock",
    Try = "$Try",
    Catch = "$Catch",
    Finally = "$Finally",
    Get = "$Get",
    Set = "$Set"
}

export const enum SpecialSigns {
    MetaSign = "@",
    TestSign = "%",
}
