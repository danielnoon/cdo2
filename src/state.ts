import Actor from "./actor";
import { primitive, rv } from "./primitives";

type frame = Record<string | typeof rv, primitive | Actor | null>;

export class State {
  private stack: frame[] = [];

  constructor(init?: frame | frame[]) {
    if (Array.isArray(init)) {
      this.stack = init;
    } else if (init) {
      this.stack.push(init);
    }
  }

  get(key: string | typeof rv): primitive | Actor | null {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
      if (frame[key] !== undefined) {
        return frame[key];
      }
    }

    return null;
  }

  set(key: string | typeof rv, value: primitive | Actor): void {
    this.stack[this.stack.length - 1][key] = value;
  }

  setPrefUpdate(key: string | typeof rv, value: primitive | Actor): void {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
      if (frame[key] !== undefined) {
        frame[key] = value;
        return;
      }
    }

    this.stack[this.stack.length - 1][key] = value;
  }

  update(key: string | typeof rv, value: primitive | Actor): void | null {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
      if (frame[key] !== undefined) {
        frame[key] = value;
        return;
      }
    }

    return null;
  }

  push(frame: frame): void {
    this.stack.push(frame);
  }

  pop(): void {
    this.stack.pop();
  }

  clone() {
    return new State(this.stack.slice());
  }
}
