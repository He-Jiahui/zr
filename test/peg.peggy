// 入口规则：模块声明（可选） + 其他顶层语句
  start = ModuleDeclaration? _ TopLevelStatement* { return $0 ? [$0].concat($1) : $1 }

  // === 词法规则 ===
  _ = [ \t\n\r]*                                      // 空白符
  Identifier = [a-zA-Z_][a-zA-Z0-9_]*                 // 普通标识符
  DecoratorIdentifier = "@" [a-zA-Z_][a-zA-Z0-9_]*    // @ 开头的标识符（如 @constructor）
  StringLiteral = '"' ( '\\"' / [^"] )* '"'           // 字符串字面量
  NumberLiteral = [0-9]+ ( '.' [0-9]+ )?              // 数字字面量

  // === 顶层语句 ===
  ModuleDeclaration
    = "module" _ name:(Identifier / StringLiteral) _ ";" { return { type: "ModuleDeclaration", name } }

  TopLevelStatement
    = StructDeclaration
    / ClassDeclaration
    / EnumDeclaration
    / InterfaceDeclaration
    / VariableDeclaration
    / ExpressionStatement
    / _

  // === 结构体（struct）===
  StructDeclaration
    = "struct" _ name:Identifier _ "{" _ members:StructMember* _ "}" {
        return { type: "Struct", name, members }
      }

  StructMember
    = AccessModifier? _ (VarDeclaration / StructMethod / StructConstructor)

  // 结构体构造函数（@ 开头的标识符）
  StructConstructor
    = decorator:DecoratorIdentifier _ "(" params:ParameterList? ")" _ Block {
        return { type: "Constructor", decorator, params: params || [], body: $5 }
      }

  // === 类（class）===
  ClassDeclaration
    = "class" _ name:Identifier _ 
      (":" _ superClass:Type _ ("," _ interfaces:TypeList)? )? 
      "{" _ members:ClassMember* _ "}" {
        return { 
          type: "Class", 
          name, 
          extends: superClass || null, 
          implements: interfaces || [],
          members 
        }
      }

  ClassMember
    = AccessModifier? _ (Method / Property / Constructor / Field)

  // 类构造函数（支持 @ 标识符）
  Constructor
    = decorator:DecoratorIdentifier _ "(" params:ParameterList? ")" _ ("super" "(" args:ArgumentList? ")")? _ Block {
        return { 
          type: "Constructor", 
          decorator, 
          params: params || [], 
          superArgs: args ? args : [], 
          body: $6 
        }
      }

  // === 接口（interface）===
  InterfaceDeclaration
    = "interface" _ name:Identifier _ "{" _ members:InterfaceMember* _ "}" {
        return { type: "Interface", name, members }
      }

  InterfaceMember
    = AccessModifier? _ (MethodSignature / PropertySignature / FieldDeclaration)

  // === 类型系统 ===
  Type
    = GenericType / TupleType / Identifier

  GenericType
    = name:Identifier "[" _ params:TypeList _ "]" { return { type: "Generic", name, params } }

  TupleType
    = "[" _ types:TypeList _ "]" { return { type: "Tuple", types } }

  // === 表达式和语句 ===
  ExpressionStatement
    = expr:Expression _ ";" { return { type: "ExpressionStatement", expr } }

  Expression
    = Literal
    / ObjectLiteral
    / ArrayLiteral
    / NewExpression
    / FunctionCall
    / Identifier

  // 对象字面量（支持动态键）
  ObjectLiteral
    = "{" _ pairs:(KeyValuePair (_ [,;]? _)*)? _ "}" { 
        return { type: "Object", properties: pairs ? pairs.flat() : [] } 
      }

  KeyValuePair
    = key:(StringLiteral / ComputedKey / Identifier) _ ":" _ value:Expression {
        return { key, value }
      }

  // === 工具规则 ===
  AccessModifier = "pub"i / "pri"i / "pro"i                  // 访问修饰符（不区分大小写）
  Literal = StringLiteral / NumberLiteral / BooleanLiteral / "null"
  BooleanLiteral = "true"i / "false"i
  ParameterList = head:Identifier _ tail:("," _ Identifier)* { return [head].concat(tail.map(t => t[2])) }
  TypeList = head:Type _ tail:("," _ Type)* { return [head].concat(tail.map(t => t[2])) }
  ArgumentList = head:Expression _ tail:("," _ Expression)* { return [head].concat(tail.map(t => t[2])) }

IDENTIFIER = [A-Za-z_][A-Za-z0-9_]* {return text();}

// 定义关键字
MODULE = "module"
STRUCT = "struct"
CLASS = "class"
INTERFACE = "interface"
ENUM = "enum"
VAR = "var"
PUB = "pub"
PRI = "pri"
PRO = "pro"
INM = "inm"
STATIC = "static"
GET = "get"
SET = "set"
BREAK = "break"
CONTINUE = "continue"
NEW = "new"
RETURN = "return"
FOR = "for"
WHILE = "while"
IF = "if"
ELSE = "else"
SWITCH = "switch"
THIS = "this"
SUPER = "super"

// 定义符号
COLON = ":"
SEMICOLON = ";"
COMMA = ","
DOT = "."
TILDE = "~"
AT = "@"
PLUS_EQUALS = "+="
MINUS_EQUALS = "-="
STAR_EQUALS = "*="
SLASH_EQUALS = "/="
PERCENT_EQUALS = "%="
PLUS = "+"
MINUS = "-"
STAR = "*"
SLASH = "/"
PERCENT = "%"
PLUS_PLUS = "++"
MINUS_MINUS = "--"
LESS_THAN_EQUALS = "<="
LESS_THAN = "<"
GREATER_THAN_EQUALS = ">="
GREATER_THAN = ">"
DOUBLE_EQUALS = "=="
BANG_EQUALS = "!="
BANG = "!"
AMPERSAND_AMPERSAND = "&&"
AMPERSAND_EQUALS = "&="
AMPERSAND = "&"
PIPE_PIPE = "||"
PIPE_EQUALS = "|="
PIPE = "|"
LPAREN = "("
RPAREN = ")"
LBRACE = "{"
RBRACE = "}"
LBRACKET = "["
RBRACKET = "]"
EQUALS = "="

// 字面量
Literal = 
    BOOLEAN
    / DECIMAL
    / FLOAT
    / HEXADECIMAL
    / OCTAL
    / STRING
    / CHAR
    / VALUENULL

DECIMAL = [1-9][0-9]*
HEXADECIMAL = "0x"[0-9a-fA-F]+
OCTAL = "0"[0-7]*
CHAR = "\'" (!["\n\r"] .)* "\'"
STRING = "\"" (!["\n\r"] .)* "\""
BOOLEAN = "true" / "false"
VALUENULL = "null"
FLOAT = ([0-9]+"."[0-9]+ / [0-9]+ / "."[0-9]+)([eE][+-]?[0-9]+)?
// 注释
Comment = 
    LineComment
    / BlockComment

LineComment = "//" (!["\n\r"] .)*
BlockComment = "/*" (!"*/" .)* "*/"
// 其它
Whitespace = [ \t\n\r]+
_ = [ \t\n\r]*  // 空白符
EOF
  = !.

