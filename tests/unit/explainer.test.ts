import { describe, expect, it } from "vitest";

import { deterministicExplanation } from "../../src/features/explainer/explainer";
import type { Puzzle } from "../../src/features/puzzles/schema";
import type { SolveResponse } from "../../src/features/solver/types";

const puzzle: Puzzle = {
  schemaVersion: 1,
  id: "crate-weights",
  title: "Crate Weights",
  kind: "arithmetic",
  difficulty: "intermediate",
  story: "Three crates hide integer weights.",
  givens: ["Red plus Blue weighs 10."],
  variables: 3,
  constraints: 17,
  skill: "Integer arithmetic mixed with finite domains.",
};

const response: SolveResponse = {
  ok: true,
  puzzleId: "crate-weights",
  status: "sat",
  durationMs: 31,
  assignments: [{ label: "Red crate", value: "3 kg", group: "Weights" }],
  diagram: "flowchart LR\nRed-->Blue",
  smtlib: "(assert true)",
  model: "",
  difficultyFacts: ["The arithmetic equalities cut through the finite domain."],
  stats: { variables: 3, constraints: 17 },
};

describe("deterministicExplanation", () => {
  it("summarizes solver status and difficulty facts", () => {
    const explanation = deterministicExplanation(puzzle, response);

    expect(explanation).toContain("Z3 found a satisfying model in 31 ms.");
    expect(explanation).toContain(
      "The arithmetic equalities cut through the finite domain.",
    );
    expect(explanation).toContain("3 variables");
  });
});
