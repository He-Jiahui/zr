// ast.ts
export type Identifier = string;

export interface Position {
  offset: number;
  line: number;
  column: number;
}

export interface BaseNode {
  type: string;
  location?: {
    start: Position;
    end: Position;
  };
}

// ====================== 模块系统 ======================
export interface ModuleDeclaration extends BaseNode {
  type: "ModuleDeclaration";
  name: string | Identifier;
}

// ====================== 结构体系统 ======================
export type StructMember = StructField | StructMethod | StructConstructor;

export interface StructDeclaration extends BaseNode {
  type: "Struct";
  name: Identifier;
  members: StructMember[];
}

export interface StructField extends BaseNode {
  type: "StructField";
  access?: "pub" | "pri" | "pro";
  name: Identifier;
  dataType?: Type;
  init?: Expression;
}

export interface StructMethod extends BaseNode {
  type: "StructMethod";
  decorator?: Identifier;
  access?: "pub" | "pri" | "pro";
  name: Identifier;
  params: Parameter[];
  returnType?: Type;
  body: Block;
}

export interface StructConstructor extends BaseNode {
  type: "StructConstructor";
  decorator: Identifier;
  params: Parameter[];
  body: Block;
}

// ====================== 类系统 ======================
export type ClassMember = ClassField | ClassMethod | ClassProperty | ClassConstructor;

export interface ClassDeclaration extends BaseNode {
  type: "Class";
  name: Identifier;
  extends?: Type;
  implements?: Type[];
  members: ClassMember[];
}

export interface ClassField extends BaseNode {
  type: "ClassField";
  decorator?: Identifier;
  access?: "pub" | "pri" | "pro";
  name: Identifier;
  dataType?: Type;
  init?: Expression;
}

export interface ClassMethod extends BaseNode {
  type: "ClassMethod";
  decorator?: Identifier;
  access?: "pub" | "pri" | "pro";
  static?: boolean;
  name: Identifier;
  params: Parameter[];
  returnType?: Type;
  body: Block;
}

export interface ClassProperty extends BaseNode {
  type: "ClassProperty";
  kind: "get" | "set";
  name: Identifier;
  returnType?: Type;
  paramType?: Type;
  body: Block;
}

export interface ClassConstructor extends BaseNode {
  type: "ClassConstructor";
  decorator: Identifier;
  params: Parameter[];
  superArgs: Expression[];
  body: Block;
}

// ====================== 接口系统 ======================
export type InterfaceMember = MethodSignature | PropertySignature | FieldDeclaration;

export interface InterfaceDeclaration extends BaseNode {
  type: "Interface";
  name: Identifier;
  members: InterfaceMember[];
}

export interface MethodSignature extends BaseNode {
  type: "MethodSignature";
  name: Identifier;
  params: Parameter[];
  returnType?: Type;
}

export interface PropertySignature extends BaseNode {
  type: "PropertySignature";
  name: Identifier;
  dataType?: Type;
  accessors?: ("get" | "set")[];
}

export interface FieldDeclaration extends BaseNode {
  type: "FieldDeclaration";
  name: Identifier;
  dataType: Type;
}

// ====================== 枚举系统 ======================
export interface EnumDeclaration extends BaseNode {
  type: "Enum";
  name: Identifier;
  baseType?: Type;
  members: EnumMember[];
}

export interface EnumMember extends BaseNode {
  type: "EnumMember";
  key: Identifier;
  value?: Expression;
}

// ====================== 类型系统 ======================
export type Type =
  | IdentifierType
  | GenericType
  | TupleType
  | FunctionType;

export interface IdentifierType extends BaseNode {
  type: "IdentifierType";
  name: Identifier;
}

export interface GenericType extends BaseNode {
  type: "GenericType";
  name: Identifier;
  params: Type[];
}

export interface TupleType extends BaseNode {
  type: "TupleType";
  elements: Type[];
}

export interface FunctionType extends BaseNode {
  type: "FunctionType";
  params: Type[];
  returnType: Type;
}

// ====================== 表达式系统 ======================
// 新增/修改部分用注释标出

// ====================== 基础表达式补充 ======================
export type Expression =
  | Literal
  | IdentifierExpression
  | BinaryExpression
  | LogicalExpression
  | UnaryExpression
  | AssignmentExpression
  | ConditionalExpression
  | CallExpression
  | ObjectLiteral
  | ArrayLiteral
  | MemberExpression    // 新增成员访问表达式
  | NewExpression       // 新增 new 表达式
  | BlockExpression;    // 新增块表达式

// ====================== Block 类型 ======================
export interface Block extends BaseNode {
  type: "Block";
  body: Statement[];
}

// ====================== 成员访问表达式 ======================
export interface MemberExpression extends BaseNode {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;    // true 表示使用 obj[prop]，false 表示使用 obj.prop
  optional?: boolean;   // 可选链语法 obj?.prop
}

// ====================== new 表达式 ======================
export interface NewExpression extends BaseNode {
  type: "NewExpression";
  callee: Expression;   // 构造函数 Identifier 或 MemberExpression
  arguments: Expression[];
}

// ====================== 修改现有类型 ======================
// 修改 ObjectProperty 支持计算属性
export interface ObjectProperty extends BaseNode {
  type: "ObjectProperty";
  key: Expression;      // 原 Identifier | Expression 简化为 Expression
  value: Expression;
  computed?: boolean;   // 是否为计算属性 [expr]
}

// 修改 BlockStatement 别名为 Block
export type BlockStatement = Block;

// 修改相关引用点
export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  then: Block;          // 原 BlockStatement 改为 Block
  else?: Block | IfStatement;
}



// ====================== 新增块表达式 ======================
export interface BlockExpression extends BaseNode {
  type: "BlockExpression";
  body: Statement[];
  return?: Expression;  // 块的最后一条表达式可作为返回值 (类似 Rust)
}

export interface Literal extends BaseNode {
  type: "Literal";
  valueType: "boolean" | "number" | "string" | "null";
  value: boolean | number | string | null;
}

export interface IdentifierExpression extends BaseNode {
  type: "Identifier";
  name: string;
}

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  operator: 
    | "+" | "-" | "*" | "/" | "%"
    | "==" | "!=" | "<" | "<=" | ">" | ">=";
  left: Expression;
  right: Expression;
}

export interface LogicalExpression extends BaseNode {
  type: "LogicalExpression";
  operator: "&&" | "||";
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: "!" | "~" | "+" | "-";
  argument: Expression;
}

export interface AssignmentExpression extends BaseNode {
  type: "AssignmentExpression";
  operator: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
  left: Expression;
  right: Expression;
}

export interface ConditionalExpression extends BaseNode {
  type: "ConditionalExpression";
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: Identifier;
  arguments: Expression[];
}

// ====================== 字面量结构 ======================
export interface ObjectLiteral extends BaseNode {
  type: "ObjectLiteral";
  properties: ObjectProperty[];
}

export interface ObjectProperty extends BaseNode {
  type: "ObjectProperty";
  key: Expression; // 支持计算属性
  value: Expression;
}

export interface ArrayLiteral extends BaseNode {
  type: "ArrayLiteral";
  elements: Expression[];
}

// ====================== 控制结构 ======================
export type Statement =
  | ExpressionStatement
  | VariableDeclaration
  | BlockStatement
  | IfStatement
  | SwitchStatement
  | LoopStatement
  | ReturnStatement
  | BreakContinueStatement;

export interface ExpressionStatement extends BaseNode {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface VariableDeclaration extends BaseNode {
  type: "VariableDeclaration";
  pattern: Identifier | DestructuringPattern;
  value: Expression;
}

export interface DestructuringPattern extends BaseNode {
  type: "DestructuringPattern";
  keys: Identifier[];
}


export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  then: BlockStatement;
  else?: BlockStatement | IfStatement;
}

export interface SwitchStatement extends BaseNode {
  type: "SwitchStatement";
  expression?: Expression;
  cases: SwitchCase[];
  default?: BlockStatement;
}

export interface SwitchCase extends BaseNode {
  type: "SwitchCase";
  value: Expression;
  body: BlockStatement;
}

export type LoopStatement = WhileLoop | ForLoop;

export interface WhileLoop extends BaseNode {
  type: "WhileLoop";
  condition: Expression;
  body: BlockStatement;
}

export interface ForLoop extends BaseNode {
  type: "ForLoop";
  init?: Expression;
  condition?: Expression;
  step?: Expression;
  body: BlockStatement;
}

export interface ReturnStatement extends BaseNode {
  type: "ReturnStatement";
  value?: Expression;
}

export interface BreakContinueStatement extends BaseNode {
  type: "BreakStatement" | "ContinueStatement";
}

// ====================== 函数系统 ======================
export interface FunctionDeclaration extends BaseNode {
  type: "FunctionDeclaration";
  name: Identifier;
  params: Parameter[];
  returnType?: Type;
  body: BlockStatement;
}

export interface Parameter extends BaseNode {
  type: "Parameter";
  name: Identifier;
  paramType: Type;
}

// ====================== 根节点类型 ======================
export type ASTNode = 
  | ModuleDeclaration
  | StructDeclaration
  | ClassDeclaration
  | InterfaceDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | Statement;

export interface Program extends BaseNode {
  type: "Program";
  body: ASTNode[];
}