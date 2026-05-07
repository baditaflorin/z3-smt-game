import { describe, expect, it } from "vitest";

import { findPuzzle, loadPuzzles } from "../../src/features/puzzles/catalog";

describe("puzzle catalog", () => {
  it("loads the bundled v1 puzzles", async () => {
    const puzzles = await loadPuzzles();

    expect(puzzles).toHaveLength(3);
    expect(puzzles.map((puzzle) => puzzle.id)).toEqual([
      "mansion-logic-grid",
      "studio-lineup",
      "crate-weights",
    ]);
  });

  it("falls back to the first puzzle for unknown ids", async () => {
    const puzzle = await findPuzzle("missing");

    expect(puzzle.id).toBe("mansion-logic-grid");
  });
});
