import { ArithOperator, ComparisonOperator } from "./types";

const arith: Record<ArithOperator, (left: number, right: number) => number> = {
  ADD: (left, right) => left + right,
  SUB: (left, right) => left - right,
  MUL: (left, right) => left * right,
  DIV: (left, right) => left / right,
  POW: (left, right) => left ** right,
  MOD: (left, right) => left % right,
};

const comp: Record<
  ComparisonOperator,
  (left: number, right: number) => boolean
> = {
  EQ: (left, right) => left === right,
  NEQ: (left, right) => left !== right,
  LT: (left, right) => left < right,
  GT: (left, right) => left > right,
  LEQ: (left, right) => left <= right,
  GEQ: (left, right) => left >= right,
};

export default class Interpreter {}
