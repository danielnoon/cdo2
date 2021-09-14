import Computer from "./actors/Computer";
import String from "./actors/String";
import Dict from "./actors/Dict";
import List from "./actors/List";
import { rv } from "./primitives";
import Math_ from "./actors/Math";

export default {
  Computer,
  String,
  Dict,
  List,
  Math: Math_,
  [rv]: null,
};
