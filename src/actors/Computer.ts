import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { State } from "../state";

const Computer = new Actor("Computer");

Computer.add(
  "print",
  new Func("print", ["thing"], new State(builtin), (...things: any[]) =>
    console.log(...things)
  )
);

Computer.add(
  "loop",
  new Func(
    "loop",
    ["thing"],
    new State(builtin),
    (iterable: any, func: Func) => {
      for (const thing of iterable) {
        const result = func.invoke(thing);
        if (result) {
          return result;
        }
      }

      return false;
    }
  )
);

Computer.add(
  "getRandomInt",
  new Func(
    "getRandomInt",
    ["min", "max"],
    new State(builtin),
    (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min
  )
);

Computer.add(
  "return",
  new Func("return", ["value"], new State(builtin), (value: any) => value)
);

export default Computer;
