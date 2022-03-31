import { primitive } from "../primitives";

export class Dict {
  private map = new Map<string, primitive>();

  constructor(obj: Record<string, primitive>) {
    for (const [key, value] of Object.entries(obj)) {
      this.map.set(key, value);
    }
  }

  get keys(): IterableIterator<string> {
    return this.map.keys();
  }

  get(key: string): primitive | undefined {
    return this.map.get(key);
  }

  set(key: string, value: primitive): void {
    this.map.set(key, value);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  entries(): IterableIterator<[string, primitive]> {
    return this.map.entries();
  }

  *[Symbol.iterator]() {
    for (const [key, value] of this.entries()) {
      yield [key, value];
    }
  }
}
