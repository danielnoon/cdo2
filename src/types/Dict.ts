import { primitive } from "../primitives";

export class Dict {
  private map = new Map<string, primitive>();

  constructor(obj: Record<string, primitive>) {
    for (const [key, value] of Object.entries(obj)) {
      this.map.set(key, value);
    }
  }

  get(key: string): primitive | undefined {
    return this.map.get(key);
  }

  set(key: string, value: primitive): void {
    this.map.set(key, value);
  }
}
