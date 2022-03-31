import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { dict } from "../primitives";
import { State } from "../state";

const Dict = new Actor("Dict");

Dict.add(
  "has",
  new Func("has", ["key"], new State(builtin), (dict: dict, key: string) =>
    dict.has(key)
  )
);

Dict.add(
  "add",
  new Func(
    "add",
    ["dict", "key", "value"],
    new State(builtin),
    (dict: dict, key: string, value: any) => dict.set(key, value)
  )
);

Dict.add(
  "get",
  new Func("get", ["key"], new State(builtin), (dict: dict, key: string) =>
    dict.get(key)
  )
);

Dict.add(
  "addAll",
  new Func(
    "addAll",
    ["dict"],
    new State(builtin),
    (dict: dict, other: dict) => {
      for (const [key, value] of other.entries()) {
        dict.set(key, value);
      }
      return dict;
    }
  )
);

Dict.add(
  "getKeys",
  new Func("getKeys", ["dict"], new State(builtin), (dict: dict) => [
    ...dict.keys,
  ])
);

export default Dict;
