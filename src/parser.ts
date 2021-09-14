import * as nearley from "nearley";
import * as grammar from "./grammar.js";
import { Node } from "./types.js";

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar as any));

export function parse(input: string): Node[] {
  parser.feed(input.trim());
  return parser.results[0];
}
