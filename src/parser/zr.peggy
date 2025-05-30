// import {buildBinaryExpression, buildLogicalExpression} from "utils";

// ====================== 语法规则 ======================
start = _ moduleName:ModuleDeclaration? _ statements:(TopLevelStatement _)* { 
  return {
    type: "Script",
    moduleName,
    statements: statements? statements.map(s=>s[0]) : [],
    location: location()
  }
}

// === 顶层语句 ===
TopLevelStatement
  = StructDeclaration
  / ClassDeclaration
  / EnumDeclaration
  / InterfaceDeclaration
  / VariableDeclaration
  / FunctionDeclaration
  / TestDeclaration
  / ExpressionStatement
  



// === 模块声明 ===
ModuleDeclaration
  = MODULE _ name:(IDENTIFIER / STRING) _ SEMICOLON {
    return { 
      type: "ModuleDeclaration",
      name,
      location: location()
    } 
  }

// === 结构体 ===
StructDeclaration
  = STRUCT _ name:IDENTIFIER _ generic:GenericDeclaration? _ LBRACE _ members:StructMember* _ RBRACE {
      return { 
        type: "StructDeclaration", 
        name, 
        members,
        generic,
        location: location()
      }
  }

StructMember
  = _ dec:(StructField / StructMethod / StructMetaFunction) _ {
    return dec; 
  }

StructMetaFunction
  = access:AccessModifier? _ staticSymbol:STATIC? _ meta:MetaIdentifier _ LPAREN _ params:ParameterList? _  args:(COMMA _ PARAMS _ Parameter _)?  _ RPAREN _ body:Block {
      return { 
        type: "StructMetaFunction",
        static: staticSymbol,
        meta, 
        params: params || [],
        args: args? args[4] : null,
        body, 
        access,
        location: location()
      }
    }
    /
    access:AccessModifier? _ staticSymbol:STATIC? _ meta:MetaIdentifier _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ body:Block {
      return { 
        type: "StructMetaFunction",
        static: staticSymbol,
        meta, 
        params: [],
        args,
        body, 
        access,
        location: location()
      }
    }


// 结构体变量声明
StructField
  = access:AccessModifier? _ staticSymbol:STATIC? _ VAR _ name:IDENTIFIER _ typePart:(COLON _ Type)? _ initPart:(EQUALS _ Expression)? _ SEMICOLON {
      return {
        type: "StructField",
        access,
        static: staticSymbol,
        name,
        typeInfo: typePart?typePart[2] : null,
        init: initPart? initPart[2] : null,
        location: location()
      }
    }

// 结构体方法
StructMethod
  = decorator:DecoratorExpression* _ access:AccessModifier? _ staticSymbol:STATIC? _ name:IDENTIFIER _ generic:GenericDeclaration?
    _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block {
      return {
        type: "StructMethod",
        decorator,
        access: access,
        static: staticSymbol,
        generic,
        name,
        params: params || [],
        args: args? args[4] : null,
        returnType: returnPart? returnPart[2] : null,
        body: body,
        location: location()
      }
    }
  /
    decorator:DecoratorExpression* _ access:AccessModifier? _ staticSymbol:STATIC? _ name:IDENTIFIER _ generic:GenericDeclaration?
    _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block {
      return {
        type: "StructMethod",
        decorator,
        access: access,
        static: staticSymbol,
        generic,
        name,
        params: [],
        args,
        returnType: returnPart? returnPart[2] : null,
        body: body,
        location: location()
      }
    }

// === 类系统 ===
ClassDeclaration
  = decorator: DecoratorExpression* CLASS _ name:IDENTIFIER _ generic:GenericDeclaration? _ 
    superPart:(COLON _ TypeList _)? 
    LBRACE _ members:ClassMember* _ RBRACE {
      return { 
        type: "ClassDeclaration", 
        name,  
        inherits: superPart?superPart[1] : [],
        members,
        decorator,
        generic,
        location: location()
      }
    }

ClassMember
  = _ dec:(Method / Property / MetaFunction / Field) _ {
    return dec;
  }

MetaFunction
  = access:AccessModifier? _ staticSymbol:STATIC? _ meta:MetaIdentifier _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ 
    argsPart:(_ SUPER _ LPAREN _ ArgumentList? _ RPAREN)? _ body:Block {
      return { 
        type: "ClassMetaFunction", 
        meta, 
        static: staticSymbol,
        params: params || [], 
        args: args? args[4] : null,
        superArgs: argsPart? argsPart[2] : [], 
        body: body,
        access,
        location: location()
      }
    }
  /
    access:AccessModifier? _ staticSymbol:STATIC? _ meta:MetaIdentifier _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ 
    argsPart:(_ SUPER _ LPAREN _ ArgumentList? _ RPAREN)? _ body:Block {
      return { 
        type: "ClassMetaFunction", 
        meta, 
        static: staticSymbol,
        params: [], 
        args,
        superArgs: argsPart? argsPart[2] : [], 
        body: body,
        access,
        location: location()
      }
    }

// 类字段
Field
  = decorator:DecoratorExpression* _ access:AccessModifier? _ staticSymbol:STATIC? _ VAR _ name:IDENTIFIER
    _ typePart:(COLON _ Type)? _ initPart:(EQUALS _ Expression)? _ SEMICOLON {
      return {
        type: "ClassField",
        decorator,
        access: access,
        static: staticSymbol,
        name,
        typeInfo: typePart?typePart[2] : null,
        init: initPart?initPart[2] : null,
        location: location()
      }
    }
// 类方法
Method
  = decorator:DecoratorExpression* _ access:AccessModifier? _ staticSymbol:STATIC? _ name:IDENTIFIER _ generic:GenericDeclaration?
    _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block {
      return {
        type: "ClassMethod",
        decorator,
        generic,
        access: access,
        static: staticSymbol,
        name,
        params: params || [],
        args: args? args[4] : null,
        returnType: returnPart?returnPart[2] : null,
        body,
        location: location()
      }
    }
  /
  decorator:DecoratorExpression* _ access:AccessModifier? _ staticSymbol:STATIC? _ name:IDENTIFIER _ generic:GenericDeclaration?
    _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block {
      return {
        type: "ClassMethod",
        decorator,
        generic,
        access: access,
        static: staticSymbol,
        name,
        params: [],
        args,
        returnType: returnPart?returnPart[2] : null,
        body,
        location: location()
      }
    }

// 类属性（getter/setter）
Property
  = decorator:DecoratorExpression* access:AccessModifier? _ staticSymbol:STATIC? _ modifier:(GetProperty / SetProperty) {
    return {
      type: "ClassProperty",
      access,
      static: staticSymbol,
      modifier,
      decorator,
      location: location()
    }
  }

GetProperty
  = GET _ name:IDENTIFIER _ returnPart:(COLON _ Type)? _ body:Block {
      return {
        type: "Property",
        kind: "get",
        name,
        targetType: returnPart?returnPart[2] : null,
        param: null,
        body,
        location: location()
      }
    }

SetProperty
  = SET _ name:IDENTIFIER _ LPAREN param:IDENTIFIER _ paramTypePart:(COLON _ Type _)? RPAREN _ body:Block {
      return {
        type: "Property",
        kind: "set",
        name,
        param,
        targetType:paramTypePart?paramTypePart[2]:null,
        body,
        location: location()
      }
    }
// === 接口 ===
InterfaceDeclaration
  = INTERFACE _ name:IDENTIFIER _ generic:GenericDeclaration? _ extendsPart:(COLON _ TypeList)? _ LBRACE _ members:InterfaceMember* _ RBRACE {
      return { 
        type: "InterfaceDeclaration", 
        name, 
        members,
        generic,
        inherits: extendsPart?extendsPart[2]:[],
        location: location()
      }
    }
// ====================== 接口成员 ======================
InterfaceMember
  = _ dec:(InterfaceMethodSignature / InterfacePropertySignature / InterfaceFieldDeclaration) _ {
    return dec;
  }

// 接口方法签名
InterfaceMethodSignature
  = access:AccessModifier? _ name:IDENTIFIER _ generic:GenericDeclaration? _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ returnPart:(COLON _ Type)? _ SEMICOLON {
      return {
        type: "InterfaceMethodSignature",
        name,
        params: params || [],
        args: args? args[4] : null,
        returnType: returnPart?returnPart[2] : null,
        access,
        generic,
        location: location()
      }
    }
  /
  access:AccessModifier? _ name:IDENTIFIER _ generic:GenericDeclaration? _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ returnPart:(COLON _ Type)? _ SEMICOLON {
      return {
        type: "InterfaceMethodSignature",
        name,
        params: [],
        args,
        returnType: returnPart?returnPart[2] : null,
        access,
        generic,
        location: location()
      }
    }

// 接口属性签名
InterfacePropertySignature
  = access:AccessModifier? _ propertyType:(GetSetModifier)? _ name:IDENTIFIER _ typePart:(COLON _ Type)? _ SEMICOLON {
      return {
        type: "InterfacePropertySignature",
        name,
        typeInfo: typePart?typePart[2] : null,
        access: access,
        propertyType,
        location: location()
      }
    }

GetSetModifier
  = GET _ SET {return "get_set"}
  / SET _ GET {return "get_set"}
  / GET {return "get"}
  / SET {return "set"}

// 接口字段声明
InterfaceFieldDeclaration
  = access:AccessModifier? _ VAR _ name:IDENTIFIER typePart:(_ COLON _ Type)? _ SEMICOLON {
      return {
        type: "InterfaceFieldDeclaration",
        name,
        targetType: typePart? typePart[3] : null,
        access,
        location: location()
      }
    }
// --- 枚举定义 ---
EnumDeclaration
  = ENUM _ name:IDENTIFIER _ baseTypePart:(COLON _ Type)? _ LBRACE _ members:EnumMember+ _ RBRACE {
      return { 
        type: "EnumDeclaration", 
        name, 
        baseType: baseTypePart?baseTypePart[2]:null, 
        members,
        location: location()
      }
    }
  // 枚举成员
EnumMember
  = _ key:IDENTIFIER _ valuePart:(EQUALS _ Expression)? _ (COMMA / SEMICOLON)? _ {
      return {
        type: "EnumMember",
        name: key, 
        value: valuePart?valuePart[2] : null,
        location: location()
      }
    }

// 泛型声明
GenericDeclaration
  = LESS_THAN _ params:Parameter+ _ GREATER_THAN _ {
    return {
      type: "GenericDeclaration",
      params,
      location: location()
    }
  }

Statement
  = _ dec:(ControlStatement
  / VariableDeclaration
  / ExpressionStatement
  / ReturnStatement
  / BreakContinueStatement
  / OutStatement
  / ThrowStatement
  / Block) _  {
    // Block 本身也是语句（如 if 的 then 块） 
    return dec;
  }
// 表达式语句（以分号结尾）
ExpressionStatement
  = expr:Expression _ SEMICOLON { 
    return { 
      type: "ExpressionStatement", 
      expr,
      location: location()
    } 
  }

// 变量声明（带分号）
VariableDeclaration
  = VAR _ pattern:(DestructuringPattern / DestructuringArrayPattern / IDENTIFIER) typePart:(COLON _ Type)? _ EQUALS _ value:Expression _ SEMICOLON { 
      return { 
        type: "VariableDeclaration", 
        pattern, 
        value,
        typeInfo: typePart? typePart[3] : null,
        location: location()
      } 
    }
// === 控制结构 ===
ControlStatement
  = IfStatement
  / SwitchStatement
  / LoopStatement
  / ReturnStatement
  / BreakContinueStatement


ReturnStatement
  = RETURN _ expr:Expression? _ SEMICOLON{
    return {
      type: "ReturnStatement",
      expr,
      location: location()
    }
  }

BreakContinueStatement
  = ctrl:(BREAK / CONTINUE) _ expr:Expression? _ SEMICOLON {
    return {
      type: "BreakContinueStatement",
      isBreak: ctrl === "break",
      expr,
      location: location()
    }
  }

OutStatement
  = OUT _ expr:Expression _ SEMICOLON {
    return {
      type: "OutStatement",
      expr,
      location: location()
    }
  }

ThrowStatement
  = THROW _ expr:Expression _ SEMICOLON {
    return {
      type: "ThrowStatement",
      expr,
      location: location()
    }
  }

IfStatement
  = expr:IfExpression {
    expr.isStatement = true;
    return expr;
  }

SwitchStatement
  = expr:SwitchExpression{
    expr.isStatement = true;
    return expr;
  }

SwitchCase
  = _ LPAREN _ value:Expression _ RPAREN _ block:Block _ { 
    return { 
      type: "SwitchCase", 
      value, 
      block,
      location: location() 
    } 
  }

SwitchDefault
  = _ LPAREN _ RPAREN _ block:Block _ { 
    return { 
      type: "SwitchDefault", 
      block,
      location: location()
    } 
  }

LoopStatement
  = expr:LoopExpression{
    expr.isStatement = true;
    return expr;
  }

LoopExpression
  = WhileLoop / ForeachLoop / ForLoop 

WhileLoop
  = WHILE _ LPAREN _ cond:Expression _ RPAREN _ block:Block {
    return {
      type: "WhileLoop",
      isStatement: false,
      cond,
      block,
      location: location()
    }
  }

ForLoop
  = FOR _ LPAREN _ init:(VariableDeclaration / SEMICOLON) _ cond:(ExpressionStatement / SEMICOLON) _ step:Expression? _ RPAREN _ block:Block{
    return {
      type: "ForLoop",
      isStatement: false,
      init,
      cond,
      step,
      block,
      location: location()
    }
  }

ForeachLoop
  = FOR _ LPAREN _ VAR _ pattern:(DestructuringPattern / DestructuringArrayPattern / IDENTIFIER) typePart:(COLON _ Type)? _ IN _ expr:Expression RPAREN _ block:Block{
    return {
      type:"ForeachLoop",
      pattern,
      isStatement: false,
      typeInfo: typePart? typePart[3] : null,
      expr,
      block,
      location: location()
    }
  }
// ====================== Block 定义 ======================
Block
  = LBRACE _ statements:Statement* _ RBRACE { 
      return { 
        type: "Block",
        isStatement: true,
        body: statements.filter(s => s !== null), // 过滤空白和注释
        location: location()
      } 
    }
// ====================== 修复后的表达式系统 ======================
Expression
  = _ exp:AssignmentExpression _ {
    return exp; 
  }

AssignmentExpression
  = left:ConditionalExpression _ op:AssignmentOperator _ right:AssignmentExpression { 
    return { 
      type: "Assignment", 
      op, 
      left, 
      right,
      location: location(),
    } 
  }
  / ConditionalExpression

ConditionalExpression
  = test:LogicalOrExpression _ QUESTIONMARK _ consequent:Expression _ COLON _ alternate:ConditionalExpression { 
    return { 
      type: "Conditional", 
      test, 
      consequent, 
      alternate,
      location: location()
    } 
  }
  / LogicalOrExpression

LogicalOrExpression
  = left:LogicalAndExpression parts:(_ PIPE_PIPE _ right:LogicalAndExpression)* { 
    return parts.reduce((acc, [,,,right]) => ({ 
      type: "Logical", 
      op: "||", 
      left: acc, 
      right, 
      location: location()
    }), left) 
  }

LogicalAndExpression
  = left:EqualityExpression parts:(_ AMPERSAND_AMPERSAND _ right:EqualityExpression)* { 
    return parts.reduce((acc, [,,,right]) => ({ 
      type: "Logical", 
      op: "&&", 
      left: acc, 
      right,
      location: location()
    }), left) 
  }

EqualityExpression
  = left:RelationalExpression parts:(_ op:EqualityOperator _ right:RelationalExpression)* { 
    return parts.reduce((acc, [,op,,right]) => ({ 
      type: "Binary", 
      op, 
      left: acc, 
      right,
      location: location()
    }), left) 
  }

RelationalExpression
  = left:AdditiveExpression parts:(_ op:RelationalOperator _ right:AdditiveExpression)* { 
    return parts.reduce((acc, [,op,,right]) => ({ 
      type: "Binary", 
      op, 
      left: acc, 
      right,
      location: location()
    }), left) 
  }

AdditiveExpression
  = left:MultiplicativeExpression parts:(_ op:AdditiveOperator _ right:MultiplicativeExpression)* { 
    return parts.reduce((acc, [,op,,right]) => ({ 
      type: "Binary", 
      op, 
      left: acc, 
      right,
      location: location() 
    }), left) 
  }

MultiplicativeExpression
  = left:UnaryExpression parts:(_ op:MultiplicativeOperator _ right:UnaryExpression)* { 
    return parts.reduce((acc, [,op,,right]) => ({ 
      type: "Binary", 
      op, 
      left: acc, 
      right,
      location: location()
    }), left) 
  }

UnaryExpression
  = op:UnaryOperator _ argument:UnaryExpression { 
    return { 
      type: "Unary", 
      op, 
      argument,
      location: location()
    } 
  }
  / property: PrimaryExpression _ members:MemberAccess*{
    return {
      type: "PrimaryExpression",
      property,
      members,
      location: location()
    }
  }
  


// ====================== 成员访问表达式规则 ======================
MemberAccess
  = DOT _ property:IDENTIFIER _ { 
    return { 
      type: "MemberExpression", 
      property, 
      computed: false,
      location: location()
    } 
  }
  / LBRACKET _ property:Expression _ RBRACKET _ { 
    return { 
      type: "MemberExpression", 
      property, 
      computed: true,
      location: location(), 
    } 
  } 
  / LPAREN _ args:ArgumentList? _ RPAREN _{
    return {
      type: "FunctionCall",
      args: args || [],
      location: location()
    }
  }


PrimaryExpression
  = value:Literal {return {type: "ValueLiteral", value, location: location()}}
  / ObjectLiteral
  / ArrayLiteral
  / UnpackLiteral
  / LambdaExpression
  / IfExpression
  / SwitchExpression
  / LoopExpression
  / value:IDENTIFIER {return {type: "IdentifierLiteral", value, location: location()}}
  / LPAREN _ expr:Expression _ RPAREN { return expr }
  / LBRACE _ block:Block _ RBRACE { 
      block.isStatement = false;
      return block 
    }
// --- 数组字面量 ---
ArrayLiteral
  = LBRACKET _ elements:(Expression (_ (COMMA / SEMICOLON) _ Expression)* _ (COMMA / SEMICOLON)?)? _ RBRACKET
  { 
    return { 
      type: 'ArrayLiteral', 
      elements: elements? ([elements[0], ...(elements[1]?elements[1].map(v=>v[3]):[])]) :[], 
      location: location()
    } 
  }

UnpackLiteral
  = PARAMS _ element: Expression _ {
    return { 
      type: 'UnpackLiteral', 
      element, 
      location: location() 
    }
  }
// 对象字面量（支持动态键）
ObjectLiteral
  = LBRACE _ pairs:(KeyValuePair (_ (COMMA / SEMICOLON)? _ KeyValuePair)* _ (COMMA / SEMICOLON)?)? _ RBRACE { 
      return { 
        type: "ObjectLiteral", 
        properties: pairs ? [pairs[0], ...(pairs[1]?pairs[1].map(v=>v[3]):[])] : [],
        location: location() 
      } 
    }
KeyValuePair
  = key:(STRING / ComputedKey / IDENTIFIER) _ COLON _ value:Expression {
      return { 
        type: "KeyValuePair",
        key, 
        value,
        location: location()
      }
    }
ComputedKey = LBRACKET _ expr:Expression _ RBRACKET { return expr }
// lambda 表达式
LambdaExpression
  = LPAREN _ params:ParameterList?  _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ RIGHT_ARROW _ block:Block _ {
    return {
      type: "LambdaExpression",
      params: params || [],
      args: args? args[4] : null,
      block,
      location: location()
    }
  }
  /
  LPAREN _ PARAMS _ args:Parameter _ RPAREN _ RIGHT_ARROW _ block:Block _ {
    return {
      type: "LambdaExpression",
      params: [],
      args,
      block,
      location: location()
    }
  }
// if 表达式（支持三元运算）
IfExpression
  = IF _ LPAREN _ condition:Expression _ RPAREN _ thenExpr:Block elseExpr:(_ ELSE _ (Block / IfExpression))? {
      return {
        type: "IfExpression",
        isStatement: false,
        condition,
        then: thenExpr,
        else: elseExpr ? elseExpr[3] : null,
        location: location()
      }
    }

// 自定义 switch 语法
SwitchExpression
  = SWITCH _ LPAREN _ expr:Expression _ RPAREN _ LBRACE _ 
  cases:SwitchCase* defaultCase:SwitchDefault? _ RBRACE {
      return {
        type: "SwitchExpression",
        isStatement: false,
        expr,
        cases: cases? cases : [],
        default: defaultCase,
        location: location()
      }
    }


// === 操作符定义 ===
AssignmentOperator
  = EQUALS / PLUS_EQUALS / MINUS_EQUALS / STAR_EQUALS / SLASH_EQUALS / PERCENT_EQUALS

EqualityOperator
  = DOUBLE_EQUALS / BANG_EQUALS

RelationalOperator
  = LESS_THAN_EQUALS / GREATER_THAN_EQUALS / LESS_THAN / GREATER_THAN 

AdditiveOperator
  = PLUS / MINUS

MultiplicativeOperator
  = STAR / SLASH / PERCENT

UnaryOperator
  = (BANG / TILDE / PLUS / MINUS / DOLLAR / NEW) {
    return {
      type: "UnaryOperator",
      operator:text(),
      location: location()
    }
  }

// === 函数系统 ===
FunctionDeclaration
  = _ decorator:DecoratorExpression* _ name:IDENTIFIER _ generic:GenericDeclaration? _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block{
    return {
      type: "FunctionDeclaration",
      name,
      params: params || [],
      args: args? args[4] : null,
      generic,
      decorator,
      returnType: returnPart? returnPart[2] : null,
      body,
      location: location
    }
  }
  /
  _ decorator:DecoratorExpression* _ name:IDENTIFIER _ generic:GenericDeclaration? _ LPAREN _ PARAMS _ args:Parameter _ RPAREN _ returnPart:(COLON _ Type)? _ body:Block{
    return {
      type: "FunctionDeclaration",
      name,
      params: [],
      args,
      generic,
      decorator,
      returnType: returnPart? returnPart[2] : null,
      body,
      location: location
    }
  }

// === 测试代码 ===
TestDeclaration
  = TEST _ name: STRING _ LPAREN _ params:ParameterList? _ args:(COMMA _ PARAMS _ Parameter _)? _ RPAREN _ body:Block {
    return {
      type: "TestDeclaration",
      name,
      params: params || [],
      args: args? args[4] : null,
      body,
      location: location()
    }
  }


// === 工具规则 ===
AccessModifier = PUB / PRI / PRO
Type = name:(GenericType / TupleType / IDENTIFIER) _ dimensions:(LBRACKET RBRACKET)* {
  return {
    type: "Type",
    name,
    dimensions: dimensions.length,
    location: location()
  }
}
GenericType = name:IDENTIFIER _ LESS_THAN _ params:TypeList _ GREATER_THAN _ {
  return{
    type: "GenericType",
    name,
    params,
    location: location()
  }
}
TupleType = LBRACKET _ types:TypeList _ RBRACKET _ {
  return{
    type: "TupleType",
    elements: types,
    location: location()
  }
}
// 辅助规则补充
Parameter
  = name:IDENTIFIER _ typePart:(COLON _ Type)? _ defaultValuePart:(EQUALS _ Expression)? { 
    return {
      type: "Parameter",
      name, 
      typeInfo: typePart? typePart[2] : null,
      defaultValue: defaultValuePart? defaultValuePart[2] : null,
      location: location(),
    } 
  }

ParameterList
  = head:Parameter _ tail:(COMMA _ Parameter _)* { 
      return [head].concat(tail.map(t => t[2])) 
    }
ArgumentList = head:Expression _ tail:(COMMA _ Expression _)* {
    return [head].concat(tail.map(t => t[2])) 
  }
TypeList = head:Type _ tail:(COMMA _ Type _)* {
    return [head].concat(tail.map(t => t[2])) 
  }
MetaIdentifier = AT _ name:IDENTIFIER _ {
  return {
    type: "Meta",
    name,
    location: location()
  }
}

DecoratorExpression = SHARP _ expr:Expression _ SHARP _ {
  return {
    type: "DecoratorExpression",
    expr,
    location: location()
  }
}
// 辅助规则
DestructuringPattern
  = LBRACE _ keys:IdentifierList _ RBRACE _ { 
    return {
      type: "DestructuringObject",
      keys,
      location: location()
    } 
  }
DestructuringArrayPattern
  = LBRACKET _ keys:IdentifierList _ RBRACKET _ { 
    return {
      type: "DestructuringArray",
      keys,
      location: location()
    } 
  }

IdentifierList
  = head:IDENTIFIER _ tail:(COMMA _ IDENTIFIER _)* { 
    return [head].concat(tail.map(t => t[2])) 
  }
// ====================== 词法规则 ======================
// 标识符
IDENTIFIER = [A-Za-z_][A-Za-z0-9_]* { 
  return {
    type: "Identifier",
    name: text(),
    location: location()
  }   
}

// 关键字
MODULE = "module"
STRUCT = "struct"
CLASS = "class"
INTERFACE = "interface"
ENUM = "enum"
TEST = "test"

VAR = "var"
PUB = "pub"
PRI = "pri"
PRO = "pro"
IF = "if"
ELSE = "else"
SWITCH = "switch"
WHILE = "while"
FOR = "for"
BREAK = "break"
CONTINUE = "continue"
RETURN = "return"
SUPER = "super"
NEW = "new"
SET = "set"
GET = "get"
STATIC = "static"
IN = "in"
OUT = "out"
THROW = "throw"

// 符号
PARAMS = "..."
QUESTIONMARK = "?"
COLON = ":"
SEMICOLON = ";"
COMMA = ","
DOT = "."
TILDE = "~"
AT = "@"
SHARP = "#"
DOLLAR = "$"
LPAREN = "("
RPAREN = ")"
LBRACE = "{"
RBRACE = "}"
LBRACKET = "["
RBRACKET = "]"
EQUALS = "="
PLUS_EQUALS = "+="
MINUS_EQUALS = "-="
STAR_EQUALS = "*="
SLASH_EQUALS = "/="
PERCENT_EQUALS = "%="
DOUBLE_EQUALS = "=="
BANG_EQUALS = "!="
BANG = "!"
LESS_THAN = "<"
LESS_THAN_EQUALS = "<="
GREATER_THAN = ">"
GREATER_THAN_EQUALS = ">="
PLUS = "+"
MINUS = "-"
STAR = "*"
SLASH = "/"
PERCENT = "%"
AMPERSAND_AMPERSAND = "&&"
PIPE_PIPE = "||"
RIGHT_ARROW = "=>"
// 字面量
Literal
  = BOOLEAN
  / FLOAT
  / HEXADECIMAL
  / OCTAL
  / DECIMAL
  / STRING
  / CHAR
  / VALUENULL

BOOLEAN = ("true" / "false") {
  return {
    type: "Boolean",
    value: text() == "true",
    location: location()
  }
}
DECIMAL = [1-9][0-9]* {
  return {
    type: "Integer",
    value: parseInt(text(), 10),
    location: location()
  }
}
HEXADECIMAL = "0x"[0-9a-fA-F]+ {
  return {
    type: "Integer",
    value: parseInt(text(), 16),
    location: location()
  }
}
OCTAL = "0"[0-7]* {
  return {
    type: "Integer",
    value: parseInt(text(), 8),
    location: location()
  }
}
CHAR = "'" ch:(!["\n\r"] .) "'"{
  return {
    type:"Char",
    value:ch? ch[1]: '',
    location: location()
  }
}
STRING = "\"" str:(!["\n\r"] .)* "\"" {
  return{ 
    type: "String",
    value: str? str.map(v=>v[1]).join('') : '',
    location: location()
  }
}
VALUENULL = "null" {
  return {
    type: "Null",
    location: location()
  }
}
FLOAT = ([0-9]+"."[0-9]* / "."[0-9]+)([eE][+-]?[0-9]+)? {
  return {
    type:"Float",
    value:parseFloat(text()),
    location: location()
  };
}

// 注释与空白
Comment = LineComment / BlockComment
LineComment = "//" (![\n\r] .)*
BlockComment = "/*" (!"*/" .)* "*/"
Whitespace = [ \t\n\r]+
_ = (Whitespace / Comment)* {
  return undefined;
}


