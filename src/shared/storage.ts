import { z } from "zod";

const storageSchema = z.object({
  selectedPuzzleId: z.string().optional(),
  completedPuzzleIds: z.array(z.string()).default([]),
  llmEndpoint: z.string().default("http://localhost:11434/api/generate"),
  llmModel: z.string().default("llama3.2"),
});

export type StoredState = z.infer<typeof storageSchema>;

const key = "z3-smt-game:v1";

export function readStoredState(): StoredState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return storageSchema.parse({});
    return storageSchema.parse(JSON.parse(raw));
  } catch {
    return storageSchema.parse({});
  }
}

export function writeStoredState(state: StoredState): void {
  try {
    localStorage.setItem(key, JSON.stringify(storageSchema.parse(state)));
  } catch {
    return;
  }
}
