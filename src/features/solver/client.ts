import { wrap } from "comlink";

import type { SolverApi } from "./types";

let api: SolverApi | undefined;

export function getSolverApi(): SolverApi {
  if (!api) {
    const worker = new Worker(new URL("./solver.worker.ts", import.meta.url), {
      type: "module",
      name: "z3-smt-game-solver",
    });
    api = wrap<SolverApi>(worker);
  }

  return api;
}
