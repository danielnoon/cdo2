import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { State } from "../state";

const Math_ = new Actor("Math");

Math_.add(
  "log",
  new Func("log", ["x"], new State(builtin), (x: number) => Math.log(x))
);

Math_.add(
  "round",
  new Func(
    "round",
    ["x", "precision"],
    new State(builtin),
    (x: number, precision: number) =>
      Math.round(x * 10 ** precision) / 10 ** precision
  )
);

export default Math_;
