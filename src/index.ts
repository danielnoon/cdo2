import { readFileSync } from "fs";
import Actor from "./actor";
import builtin from "./builtin";
import Func from "./function";
import { parse } from "./parser";
import { rv } from "./primitives";
import { State } from "./state";
import {
  ArithmeticExpression,
  ArithOperator,
  ComparisonOperator,
  CompExpression,
  Expression,
  FuncBody,
  Node,
  FuncExpr,
  IfStatement,
} from "./types";

const input = readFileSync(
  __dirname + "/../examples/leet/power-of-three.cdo",
  "utf-8"
);

const data = parse(input);

const arith: Record<ArithOperator, (left: number, right: number) => number> = {
  ADD: (left: number, right: number) => left + right,
  SUB: (left: number, right: number) => left - right,
  MUL: (left: number, right: number) => left * right,
  DIV: (left: number, right: number) => left / right,
  POW: (left: number, right: number) => left ** right,
  MOD: (left: number, right: number) => left % right,
};

function doArithOp(expr: ArithmeticExpression, state: State) {
  const left = evalExpression(expr.left, state);
  const right = evalExpression(expr.right, state);
  return arith[expr.op](left, right);
}

const comp: Record<
  ComparisonOperator,
  (left: number, right: number) => boolean
> = {
  EQ: (left: number, right: number) => left === right,
  NEQ: (left: number, right: number) => left !== right,
  LT: (left: number, right: number) => left < right,
  GT: (left: number, right: number) => left > right,
  LEQ: (left: number, right: number) => left <= right,
  GEQ: (left: number, right: number) => left >= right,
};

function doCompOp(expr: CompExpression, state: State) {
  const left = evalExpression(expr.left, state);
  const right = evalExpression(expr.right, state);
  return comp[expr.op](left, right);
}

function evalExpression(expr: Expression, state: State): any {
  if (expr.type === "number") {
    return expr.value;
  } else if (expr.type === "string") {
    return expr.value;
  } else if (expr.type === "boolean") {
    return expr.value;
  } else if (expr.type === "id") {
    return (
      state.get(expr.value) ?? fatalError(`Unknown variable ${expr.value}`)
    );
  } else if (expr.type === "ARITH") {
    return doArithOp(expr, state);
  } else if (expr.type === "COMP") {
    return doCompOp(expr, state);
  } else if (expr.type === "FUNCTION") {
    return new Func(
      "anonymous",
      expr.params.map((p) => p.value),
      state.clone(),
      (...args: any[]) =>
        executeFunc(
          expr.body,
          expr.params.map((p) => p.value),
          args,
          state
        )
    );
  } else if (expr.type === "CALL") {
    const fn = evalExpression(expr.expr, state);
    if (fn instanceof Func) {
      return fn.invoke(...expr.args.map((a) => evalExpression(a, state)));
    } else {
      return fatalError(`Cannot call non-function ${fn}`);
    }
  } else if (expr.type === "GETTER") {
    const actor = state.get(expr.actor.value);
    if (!(actor instanceof Actor)) {
      return fatalError(`${expr.actor.value} is not an actor`);
    }

    const action = actor.get(expr.action.value);
    if (!action) {
      return fatalError(
        `${expr.actor.value} does not have action ${expr.action.value}`
      );
    }

    return action;
  } else if (expr.type === "TIMES") {
    const n = evalExpression(expr.number, state);
    if (typeof n !== "number") {
      return fatalError(`Cannot enumerate non-number ${n}`);
    }
    return new Array(n).fill(0).map((_, i) => i);
  } else if (expr.type === "LIST") {
    return expr.elements.map((i) => evalExpression(i, state));
  } else if (expr.type === "DICT") {
    return expr.entries.reduce(
      (acc, p) => ({ ...acc, [p.key.value]: evalExpression(p.value, state) }),
      {}
    );
  } else if (expr.type === "SELECTOR") {
    const base = evalExpression(expr.base, state);
    const key = evalExpression(expr.expr, state);
    const value = base[key];
    if (value === undefined) {
      return fatalError(`${base} does not have key ${key}`);
    }
    return value;
  } else if (expr.type === "LOGICAL") {
    if (expr.op === "NOT") {
      return !evalExpression(expr.operand, state);
    } else if (expr.op === "AND") {
      return (
        evalExpression(expr.left, state) && evalExpression(expr.right, state)
      );
    } else if (expr.op === "OR") {
      return (
        evalExpression(expr.left, state) || evalExpression(expr.right, state)
      );
    } else {
      return fatalError(`Unknown logic op ${expr.op}`);
    }
  }
}

function executeFunc(
  body: FuncBody | FuncExpr,
  params: string[],
  args: any[],
  state: State
) {
  state.push({ [rv]: null });
  for (let i = 0; i < params.length; i++) {
    state.set(params[i], args[i]);
  }

  if (body.type === "FUNCEXPR") {
    state.set(rv, evalExpression(body.body, state.clone()));
  } else if (body.type === "FUNCBODY") {
    execute(body.body, state.clone());
  }

  const returnValue = state.get(rv);
  state.pop();
  return returnValue;
}

function fatalError(message: string) {
  console.error("FATAL ERROR: ", message);
  process.exit(1);
}

function execute(data: Node[], state: State) {
  for (const node of data) {
    if (state.get(rv) !== null) return;

    if (node.type === "INSTRUCTION") {
      const evaluatedArguments = node.args.map((arg) =>
        evalExpression(arg, state)
      );

      if (node.action.value === "return" && node.actor.value === "Computer") {
        state.set(rv, evaluatedArguments[0]);
        return;
      }

      const actor = state.get(node.actor.value);
      if (!(actor instanceof Actor)) {
        fatalError(`${node.actor} is not an actor.`);
        return;
      }

      const action = actor.get(node.action.value);
      if (!(action instanceof Func)) {
        fatalError(`${node.action} is not an action.`);
        return;
      }

      const value = action.invoke(...evaluatedArguments);
      if (node.assign) {
        state.setPrefUpdate(node.assign.value, value);
      }
    } else if (node.type === "ASSIGNMENT") {
      const value = evalExpression(node.value, state);
      if (node.dest.type === "SELECTOR") {
        const base = evalExpression(node.dest.base, state);
        const key = evalExpression(node.dest.expr, state);
        base[key] = value;
      } else {
        state.set(node.dest.value, value);
      }
    } else if (node.type === "REASSIGNMENT") {
      const value = evalExpression(node.value, state);
      const result = state.update(node.dest.value, value);
      if (result === null) {
        fatalError(`${node.dest.value} is not defined.`);
      }
    } else if (node.type === "ACTOR") {
      const actor = new Actor(node.name.value);
      state.set(node.name.value, actor);

      for (const member of node.body) {
        const value = evalExpression(member.value, state);
        if (member.dest.type === "SELECTOR") {
          return fatalError(
            "Only actions and actor members may be defined here."
          );
        }
        actor.add(member.dest.value, value);
      }
    } else if (node.type === "CONDITIONAL") {
      function test(stmt: IfStatement) {
        const condition = evalExpression(stmt.test, state);
        if (condition) {
          execute(stmt.body, state);
        } else if (stmt.else) {
          if (stmt.else.type === "CONDITIONAL") {
            test(stmt.else);
          } else {
            execute(stmt.else.body, state);
          }
        }
      }

      test(node);
    } else if (node.type === "CALL") {
      const func = evalExpression(node.expr, state);
      if (!(func instanceof Func)) {
        return fatalError(`${func} is not a function.`);
      }

      const evaluatedArguments = node.args.map((arg) =>
        evalExpression(arg, state)
      );
      func.invoke(...evaluatedArguments);
    }
  }
}

execute(data, new State(builtin));
