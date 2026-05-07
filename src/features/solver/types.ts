import type { Puzzle } from "../puzzles/schema";

export type SolveStatus =
  | "idle"
  | "initializing"
  | "sat"
  | "unsat"
  | "unknown"
  | "error";

export type Assignment = {
  label: string;
  value: string;
  group: string;
};

export type SolveRequest = {
  puzzleId: Puzzle["id"];
};

export type SolveResponse =
  | {
      ok: true;
      puzzleId: Puzzle["id"];
      status: Exclude<SolveStatus, "idle" | "initializing" | "error">;
      durationMs: number;
      assignments: Assignment[];
      diagram: string;
      smtlib: string;
      model: string;
      difficultyFacts: string[];
      stats: {
        variables: number;
        constraints: number;
      };
    }
  | {
      ok: false;
      puzzleId: Puzzle["id"];
      status: "error";
      durationMs: number;
      message: string;
      detail?: string;
    };

export type SolverApi = {
  solve(request: SolveRequest): Promise<SolveResponse>;
  warm(): Promise<{ isolated: boolean }>;
};
