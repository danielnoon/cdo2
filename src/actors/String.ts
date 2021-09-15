import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { State } from "../state";

const String = new Actor("String");

String.add(
  "getLength",
  new Func(
    "anonymous",
    ["str"],
    new State(builtin),
    (str: string) => str.length
  )
);

String.add(
  "getChar",
  new Func(
    "anonymous",
    ["str", "idx"],
    new State(builtin),
    (str: string, index: number) => str[index]
  )
);

String.add(
  "getSlice",
  new Func(
    "anonymous",
    ["str", "start", "end"],
    new State(builtin),
    (str: string, start: number, end: number) => str.substring(start, end)
  )
);

String.add(
  "getIndex",
  new Func(
    "anonymous",
    ["str", "search"],
    new State(builtin),
    (str: string, search: string) => str.indexOf(search)
  )
);

String.add(
  "getLastIndex",
  new Func(
    "anonymous",
    ["str", "search"],
    new State(builtin),
    (str: string, search: string) => str.lastIndexOf(search)
  )
);

String.add(
  "replace",
  new Func(
    "anonymous",
    ["str", "search", "replace"],
    new State(builtin),
    (str: string, search: string, replace: string) =>
      str.replace(search, replace)
  )
);

String.add(
  "toLowerCase",
  new Func("anonymous", ["str"], new State(builtin), (str: string) =>
    str.toLowerCase()
  )
);

String.add(
  "toUpperCase",
  new Func("anonymous", ["str"], new State(builtin), (str: string) =>
    str.toUpperCase()
  )
);

String.add(
  "concat",
  new Func(
    "anonymous",
    ["str"],
    new State(builtin),
    (str: string, ...args: string[]) => str.concat(...args)
  )
);

export default String;
