import Actor from "../actor";
import builtin from "../builtin";
import Func from "../function";
import { State } from "../state";

const List = new Actor("List");

List.add(
  "join",
  new Func(
    "join",
    ["separator", "list"],
    new State(builtin),
    (separator: string, list: string[]) => list.join(separator)
  )
);

List.add(
  "map",
  new Func(
    "map",
    ["list", "func"],
    new State(builtin),
    (list: any[], func: Func) => list.map((...args) => func.invoke(...args))
  )
);

List.add(
  "copy",
  new Func(
    "copy",
    ["list", "start", "end"],
    new State(builtin),
    (list: any[], start: number, end: number) => list.slice(start, end)
  )
);

List.add(
  "length",
  new Func("length", ["list"], new State(builtin), (list: any[]) => list.length)
);

export default List;
