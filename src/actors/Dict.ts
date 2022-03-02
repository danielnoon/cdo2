import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { dict } from "../primitives";
import { State } from "../state";

const Dict = new Actor("Dict");

Dict.add(
  "has",
  new Func("has", ["key"], new State(builtin), (dict: dict, key: string) =>
    Object.getOwnPropertyNames(dict).includes(key)
  )
);

Dict.add(
  "addAll",
  new Func(
    "addAll",
    ["dict"],
    new State(builtin),
    (dict: dict, other: dict) => {
      Object.assign(dict, other);
      return dict;
    }
  )
);

export default Dict;
