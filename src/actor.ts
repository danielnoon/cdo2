import { primitive } from "./primitives";

export default class Actor {
  members: Map<string, primitive> = new Map();

  constructor(public name: string) {}

  add(name: string, member: primitive) {
    this.members.set(name, member);
  }

  get(name: string): primitive | null {
    return this.members.get(name) ?? null;
  }
}
