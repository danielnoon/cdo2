import Func from "./function";
import { Dict } from "./types/Dict";

export const rv = Symbol("return");
export const NULL = Symbol("null");

export type dict = Dict;
export type list = any[];
export type primitive =
  | string
  | number
  | boolean
  | dict
  | list
  | Func
  | typeof NULL;

export function isPrimitive(x: any): x is primitive {
  return (
    typeof x === "string" ||
    typeof x === "number" ||
    typeof x === "boolean" ||
    x instanceof Dict ||
    x instanceof Array ||
    x instanceof Func
  );
}
