export interface NodeBase {
  type: string;
}

export interface Token extends NodeBase {
  text: string;
  offset: number;
  line: number;
  column: number;
}

export interface Identifier extends Token {
  type: "id";
  value: string;
}

export interface StringLiteral extends Token {
  type: "string";
  value: string;
}

export interface NumberLiteral extends Token {
  type: "number";
  value: number;
}

export interface BooleanLiteral extends Token {
  type: "boolean";
  value: boolean;
}

export interface Actor extends NodeBase {
  type: "ACTOR";
  name: Identifier;
  body: Assignment[];
}

export interface Assignment extends NodeBase {
  type: "ASSIGNMENT";
  dest: Identifier | SelectorExpression;
  value: Expression;
}

export interface Reassignment extends NodeBase {
  type: "REASSIGNMENT";
  dest: Identifier;
  value: Expression;
}

export type ArithOperator = "ADD" | "SUB" | "MUL" | "DIV" | "POW" | "MOD";

export interface ArithmeticExpression extends NodeBase {
  type: "ARITH";
  op: ArithOperator;
  left: Expression;
  right: Expression;
}

export type ComparisonOperator = "EQ" | "NEQ" | "LT" | "LEQ" | "GT" | "GEQ";

export interface CompExpression extends NodeBase {
  type: "COMP";
  op: ComparisonOperator;
  left: Expression;
  right: Expression;
}

export type BinaryLogicalOperator = "AND" | "OR";

export interface BinaryLogicalExpression extends NodeBase {
  type: "LOGICAL";
  op: BinaryLogicalOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | ArithOperator
  | ComparisonOperator
  | BinaryLogicalOperator;

export interface UnaryLogicalExpression extends NodeBase {
  type: "LOGICAL";
  op: "NOT";
  operand: Expression;
}

export type LogicalExpression =
  | BinaryLogicalExpression
  | UnaryLogicalExpression;

export interface TimesExpression extends NodeBase {
  type: "TIMES";
  number: Expression;
}

export interface CallExpression extends NodeBase {
  type: "CALL";
  expr: Expression;
  args: Expression[];
}

export interface GetterExpression extends NodeBase {
  type: "GETTER";
  actor: Identifier;
  action: Identifier;
}

export interface SelectorExpression extends NodeBase {
  type: "SELECTOR";
  base: Expression;
  expr: Expression;
}

export interface List extends NodeBase {
  type: "LIST";
  elements: Expression[];
}

export interface Dict extends NodeBase {
  type: "DICT";
  entries: { key: Identifier; value: Expression }[];
}

export type LiteralExpression =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | List
  | Dict;

export type Expression =
  | CallExpression
  | GetterExpression
  | SelectorExpression
  | LiteralExpression
  | ArithmeticExpression
  | CompExpression
  | LogicalExpression
  | TimesExpression
  | Function
  | Identifier;

export interface Function extends NodeBase {
  type: "FUNCTION";
  params: Identifier[];
  body: FuncBody | FuncExpr;
}

export interface FuncBody extends NodeBase {
  type: "FUNCBODY";
  body: Node[];
}

export interface FuncExpr extends NodeBase {
  type: "FUNCEXPR";
  body: Expression;
}

export interface Instruction extends NodeBase {
  type: "INSTRUCTION";
  actor: Identifier;
  action: Identifier;
  args: Expression[];
  assign: Identifier | null;
}

export interface IfStatement extends NodeBase {
  type: "CONDITIONAL";
  test: Expression;
  body: Node[];
  else: ElseStatement | IfStatement | null;
}

export interface ElseStatement extends NodeBase {
  type: "ELSE";
  body: Node[];
}

export type Node =
  | Actor
  | Assignment
  | Reassignment
  | Function
  | Instruction
  | IfStatement
  | Expression;
