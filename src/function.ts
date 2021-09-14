import { State } from "./state";

export default class Func {
  constructor(
    public name: string,
    public params: string[],
    public scope: State,
    public invoke: Function
  ) {}
}
