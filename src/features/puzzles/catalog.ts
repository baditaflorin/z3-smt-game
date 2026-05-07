import { QueryClient } from "@tanstack/query-core";

import { puzzleCatalogSchema, type Puzzle } from "./schema";

const rawPuzzles: Puzzle[] = [
  {
    schemaVersion: 1,
    id: "mansion-logic-grid",
    title: "Mansion Logic Grid",
    kind: "logic-grid",
    difficulty: "beginner",
    story:
      "Three puzzle hunters each entered one room and found one artifact. Reconstruct the grid from the clues.",
    givens: [
      "Bruno worked in the Workshop.",
      "The Key was found in the Library.",
      "Ada found the Map.",
      "Cora was not in the Atrium.",
      "The Lens was found in the Workshop."
    ],
    variables: 6,
    constraints: 15,
    skill: "Finite-domain matching with two all-different groups."
  },
  {
    schemaVersion: 1,
    id: "studio-lineup",
    title: "Studio Lineup",
    kind: "schedule",
    difficulty: "intermediate",
    story:
      "Five lightning talks must be ordered before the recording crew arrives. The clues pin down the only valid lineup.",
    givens: [
      "Every talk occupies a different slot from 1 to 5.",
      "Boards happens immediately after Demos.",
      "Circuits is exactly third.",
      "Encoding happens after Axioms.",
      "Demos happens after Circuits.",
      "Encoding is not first or last."
    ],
    variables: 5,
    constraints: 18,
    skill: "Ordering, adjacency, and all-different propagation."
  },
  {
    schemaVersion: 1,
    id: "crate-weights",
    title: "Crate Weights",
    kind: "arithmetic",
    difficulty: "intermediate",
    story:
      "Three labeled crates hide integer weights. The scale clues are enough for Z3 to isolate the weights.",
    givens: [
      "Each crate weighs a distinct whole number from 1 to 9.",
      "Red plus Blue weighs 10.",
      "Green weighs 2 more than Red.",
      "Blue is heavier than Green.",
      "Red weighs an odd number.",
      "Blue weighs less than 8."
    ],
    variables: 3,
    constraints: 17,
    skill: "Integer arithmetic mixed with finite domains."
  }
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false
    }
  }
});

export async function loadPuzzles(): Promise<Puzzle[]> {
  return queryClient.fetchQuery({
    queryKey: ["puzzles", 1],
    queryFn: async () => puzzleCatalogSchema.parse(rawPuzzles)
  });
}

export async function findPuzzle(id: string): Promise<Puzzle> {
  const puzzles = await loadPuzzles();
  return puzzles.find((puzzle) => puzzle.id === id) ?? puzzles[0];
}
