import Actor from "./actor";
import builtin from "./builtin";
import Func from "./function";
import { isPrimitive, NULL, primitive, rv } from "./primitives";
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
import { Dict } from "./types/Dict";

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
  if (typeof left !== "number" || typeof right !== "number") {
    return fatalError("Arithmetic operation on non-numbers.");
  }
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
  const left = evalExpression(expr.left, state) as any;
  const right = evalExpression(expr.right, state) as any;
  return comp[expr.op](left, right);
}

function evalExpression(
  expr: Expression,
  state: State
): primitive | Actor | void {
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
      return fatalError(`Cannot call non-function ${String(fn)}`);
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
      return fatalError(`Cannot enumerate non-number ${String(n)}`);
    }
    return new Array(n).fill(0).map((_, i) => i);
  } else if (expr.type === "LIST") {
    return expr.elements.map((i) => evalExpression(i, state));
  } else if (expr.type === "DICT") {
    const dict = expr.entries.reduce(
      (acc, p) => ({ ...acc, [p.key.value]: evalExpression(p.value, state) }),
      {}
    );
    return new Dict(dict);
  } else if (expr.type === "SELECTOR") {
    const base = evalExpression(expr.base, state);
    const key = evalExpression(expr.expr, state);
    if (base instanceof Dict) {
      if (!(typeof key === "string")) {
        return fatalError(`Cannot select non-string key ${String(key)}`);
      }
      const value = base.get(key);
      if (value === undefined) {
        return fatalError(`Cannot select unknown key ${key}`);
      }
    } else if (base instanceof Array) {
      if (typeof key !== "number") {
        return fatalError(
          `Cannot index array with non-number key ${String(key)}`
        );
      }
      const value = base[key];
      if (value === undefined) {
        return fatalError(`${base} does not have key ${String(key)}`);
      }
      return value;
    }
    return "lol";
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
    const result = evalExpression(body.body, state.clone());
    state.set(rv, result ?? NULL);
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
        const value = evaluatedArguments[0];
        state.set(rv, value ?? NULL);
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
        if (base instanceof Dict) {
          if (typeof key !== "string") {
            return fatalError(`Cannot select non-string key ${String(key)}`);
          }
          if (value instanceof Actor) {
            return fatalError(`Cannot assign actor to dict key ${String(key)}`);
          }
          base.set(key, value ?? NULL);
        } else if (base instanceof Array) {
          if (typeof key !== "number") {
            return fatalError(
              `Cannot index array with non-number key ${String(key)}`
            );
          }
          base[key] = value;
        }
      } else {
        state.set(node.dest.value, value ?? NULL);
      }
    } else if (node.type === "REASSIGNMENT") {
      const value = evalExpression(node.value, state);
      const result = state.update(node.dest.value, value ?? NULL);
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
        if (value instanceof Actor) {
          return fatalError(
            "Only actions and actor members may be defined here."
          );
        }
        actor.add(member.dest.value, value ?? NULL);
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
        return fatalError(`${String(func)} is not a function.`);
      }

      const evaluatedArguments = node.args.map((arg) =>
        evalExpression(arg, state)
      );
      func.invoke(...evaluatedArguments);
    }
  }
}

export function run(data: Node[]) {
  execute(data, new State(builtin));
}
