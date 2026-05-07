import { z } from "zod";

export const puzzleSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  kind: z.enum(["logic-grid", "schedule", "arithmetic"]),
  difficulty: z.enum(["beginner", "intermediate", "expert"]),
  story: z.string().min(1),
  givens: z.array(z.string().min(1)).min(1),
  variables: z.number().int().positive(),
  constraints: z.number().int().positive(),
  skill: z.string().min(1)
});

export const puzzleCatalogSchema = z.array(puzzleSchema).min(1);

export type Puzzle = z.infer<typeof puzzleSchema>;
export type PuzzleId = Puzzle["id"];
