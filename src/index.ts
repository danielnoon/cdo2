#!/usr/bin/env node

import { readFileSync } from "fs";
import { resolve } from "path";
import { run } from "./interpreter";
import { parse } from "./parser";

const args = process.argv.slice(2);

const input = readFileSync(resolve(process.cwd(), args[0]), "utf-8");

run(parse(input));
