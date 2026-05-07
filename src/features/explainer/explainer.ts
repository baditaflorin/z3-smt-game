import type { Puzzle } from "../puzzles/schema";
import type { SolveResponse } from "../solver/types";

export type LocalLlmSettings = {
  endpoint: string;
  model: string;
};

export function deterministicExplanation(puzzle: Puzzle, response: SolveResponse): string {
  if (!response.ok) {
    return `Z3 could not finish this run: ${response.message}`;
  }

  const facts = response.difficultyFacts.map((fact) => `- ${fact}`).join("\n");
  const statusLine =
    response.status === "sat"
      ? `Z3 found a satisfying model in ${response.durationMs} ms.`
      : `Z3 returned ${response.status} in ${response.durationMs} ms.`;

  return `${statusLine}

What made "${puzzle.title}" interesting:
${facts}

The puzzle has ${response.stats.variables} variables and about ${response.stats.constraints} constraints. The hard move is propagation: each clue removes several possible worlds at once, and Z3 keeps only assignments that satisfy all clues together.`;
}

export async function askLocalLlm(
  puzzle: Puzzle,
  response: SolveResponse,
  settings: LocalLlmSettings
): Promise<string> {
  if (!response.ok) {
    return deterministicExplanation(puzzle, response);
  }

  const endpoint = settings.endpoint.trim();
  const model = settings.model.trim() || "llama3.2";
  if (!endpoint) {
    return deterministicExplanation(puzzle, response);
  }

  const prompt = [
    "Explain this SMT puzzle like recreational math.",
    "Keep it under 170 words.",
    "Focus on why the constraints are hard and how Z3 prunes the search.",
    "",
    `Puzzle: ${puzzle.title}`,
    `Story: ${puzzle.story}`,
    `Clues: ${puzzle.givens.join(" | ")}`,
    `Status: ${response.status}`,
    `Assignments: ${response.assignments.map((item) => `${item.label}=${item.value}`).join(", ")}`,
    `SMT-LIB: ${response.smtlib}`
  ].join("\n");

  const llmResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2
      }
    })
  });

  if (!llmResponse.ok) {
    throw new Error(`Local LLM returned ${llmResponse.status}.`);
  }

  const body = (await llmResponse.json()) as { response?: unknown; choices?: { text?: unknown }[] };
  if (typeof body.response === "string") {
    return body.response.trim();
  }

  const firstChoice = body.choices?.[0]?.text;
  if (typeof firstChoice === "string") {
    return firstChoice.trim();
  }

  throw new Error("Local LLM response did not include text.");
}
