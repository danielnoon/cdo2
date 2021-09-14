import Func from "./function";

export const rv = Symbol("return");

export type dict = { [key: string]: any };
export type list = any[];
export type primitive = string | number | boolean | dict | list | Func;
