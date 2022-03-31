import { State } from "./state";

interface ParamBase {
  type: string;
}

interface ScalarParam extends ParamBase {
  type: "SCALAR";
  name: string;
}

interface UnpackParam extends ParamBase {
  type: "UNPACK";
  ids: string[];
}

interface OptionalParam extends ParamBase {
  type: "OPTIONAL_PARAM";
  name: string;
}

export type Param = ScalarParam | UnpackParam | OptionalParam;

export default class Func {
  constructor(
    public name: string,
    public params: (Param | string)[],
    public scope: State,
    public invoke: Function
  ) {}
}
