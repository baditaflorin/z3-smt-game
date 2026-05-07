import { askLocalLlm, deterministicExplanation } from "./features/explainer/explainer";
import { renderMermaid } from "./features/diagram/mermaid";
import { loadPuzzles } from "./features/puzzles/catalog";
import type { Puzzle } from "./features/puzzles/schema";
import { getSolverApi } from "./features/solver/client";
import type { SolveResponse } from "./features/solver/types";
import { readStoredState, writeStoredState, type StoredState } from "./shared/storage";
import { appVersion, gitCommit, shortCommit } from "./shared/version";
import "./styles.css";

const repoUrl = "https://github.com/baditaflorin/z3-smt-game";
const paypalUrl = "https://www.paypal.com/paypalme/florinbadita";

type AppState = {
  puzzles: Puzzle[];
  selected: Puzzle;
  stored: StoredState;
  response?: SolveResponse;
  explanation: string;
  busy: boolean;
};

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("App root is missing.");
}
const appRoot = root;

let state: AppState;

window.addEventListener("error", (event) => {
  showToast(event.message || "Unexpected browser error.");
});

window.addEventListener("unhandledrejection", (event) => {
  showToast(event.reason instanceof Error ? event.reason.message : "Unexpected async error.");
});

async function boot(): Promise<void> {
  const stored = readStoredState();
  const puzzles = await loadPuzzles();
  const selected = puzzles.find((puzzle) => puzzle.id === stored.selectedPuzzleId) ?? puzzles[0];
  state = {
    puzzles,
    selected,
    stored,
    explanation: "",
    busy: false
  };
  render();
}

function setSelected(puzzle: Puzzle): void {
  state = {
    ...state,
    selected: puzzle,
    response: undefined,
    explanation: "",
    stored: { ...state.stored, selectedPuzzleId: puzzle.id }
  };
  writeStoredState(state.stored);
  render();
}

async function solveSelected(): Promise<void> {
  state = { ...state, busy: true, response: undefined, explanation: "" };
  render();

  const response = await getSolverApi().solve({ puzzleId: state.selected.id });
  const completedPuzzleIds =
    response.ok && response.status === "sat"
      ? Array.from(new Set([...state.stored.completedPuzzleIds, state.selected.id]))
      : state.stored.completedPuzzleIds;

  state = {
    ...state,
    busy: false,
    response,
    explanation: deterministicExplanation(state.selected, response),
    stored: { ...state.stored, completedPuzzleIds }
  };
  writeStoredState(state.stored);
  render();
  await renderDiagram(response);
}

async function renderDiagram(response: SolveResponse): Promise<void> {
  if (!response.ok) return;
  const target = document.querySelector<HTMLElement>("[data-diagram]");
  if (!target) return;

  try {
    await renderMermaid(response.diagram, target);
  } catch (error) {
    target.textContent = error instanceof Error ? error.message : "Could not render diagram.";
  }
}

async function askLlm(): Promise<void> {
  const response = state.response;
  if (!response) return;

  const endpoint = document.querySelector<HTMLInputElement>("#llm-endpoint")?.value ?? "";
  const model = document.querySelector<HTMLInputElement>("#llm-model")?.value ?? "";
  state = {
    ...state,
    busy: true,
    stored: {
      ...state.stored,
      llmEndpoint: endpoint,
      llmModel: model
    }
  };
  writeStoredState(state.stored);
  render();

  try {
    const explanation = await askLocalLlm(state.selected, response, { endpoint, model });
    state = { ...state, busy: false, explanation };
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Local LLM failed.");
    state = {
      ...state,
      busy: false,
      explanation: deterministicExplanation(state.selected, response)
    };
  }
  render();
  await renderDiagram(response);
}

function render(): void {
  const response = state.response;
  const status = state.busy ? "initializing" : response?.status ?? "idle";
  appRoot.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">Z3</div>
          <div>
            <h1>Z3 SMT Game</h1>
            <small>v${escapeHtml(appVersion)} · ${escapeHtml(shortCommit(gitCommit))}</small>
          </div>
        </div>
        <nav class="top-links" aria-label="Project links">
          <a href="${repoUrl}" target="_blank" rel="noreferrer">GitHub repo</a>
          <a href="${paypalUrl}" target="_blank" rel="noreferrer">PayPal</a>
          <a href="https://baditaflorin.github.io/z3-smt-game/" target="_blank" rel="noreferrer">Live page</a>
        </nav>
      </header>
      <main class="workspace">
        <aside class="rail" aria-label="Puzzle list">
          <h2>Puzzles</h2>
          <div class="puzzle-list">
            ${state.puzzles.map(renderPuzzleButton).join("")}
          </div>
        </aside>
        <div class="main-grid">
          ${renderPuzzlePanel(status)}
          ${response ? renderResult(response) : ""}
        </div>
      </main>
      <div class="toast hidden" role="status" aria-live="polite" data-toast></div>
    </div>
  `;

  bindEvents();
}

function renderPuzzleButton(puzzle: Puzzle): string {
  const done = state.stored.completedPuzzleIds.includes(puzzle.id) ? " solved" : "";
  return `
    <button class="puzzle-card" type="button" data-puzzle-id="${escapeHtml(puzzle.id)}" aria-pressed="${
      puzzle.id === state.selected.id
    }">
      <strong>${escapeHtml(puzzle.title)}${done}</strong>
      <span>${escapeHtml(puzzle.kind)} · ${escapeHtml(puzzle.difficulty)}</span>
    </button>
  `;
}

function renderPuzzlePanel(status: string): string {
  const puzzle = state.selected;
  return `
    <section class="panel" aria-labelledby="active-puzzle-title">
      <div class="panel-head">
        <div>
          <h2 id="active-puzzle-title">${escapeHtml(puzzle.title)}</h2>
          <p class="story">${escapeHtml(puzzle.story)}</p>
        </div>
        <span class="kind-chip">${escapeHtml(puzzle.difficulty)}</span>
      </div>
      <ul class="clues">
        ${puzzle.givens.map((given) => `<li>${escapeHtml(given)}</li>`).join("")}
      </ul>
      <div class="meta-grid" aria-label="Puzzle metadata">
        <div class="metric"><span>Variables</span><strong>${puzzle.variables}</strong></div>
        <div class="metric"><span>Constraints</span><strong>${puzzle.constraints}</strong></div>
        <div class="metric"><span>Skill</span><strong>${escapeHtml(puzzle.skill)}</strong></div>
      </div>
      <div class="solver-bar">
        <button class="primary-button" type="button" data-solve ${state.busy ? "disabled" : ""}>Solve with Z3</button>
        <span class="status-pill" data-testid="solver-status">${escapeHtml(status)}</span>
      </div>
    </section>
  `;
}

function renderResult(response: SolveResponse): string {
  if (!response.ok) {
    return `
      <section class="result-panel" aria-labelledby="result-title">
        <h2 id="result-title">Solver error</h2>
        <p>${escapeHtml(response.message)}</p>
        ${response.detail ? `<pre class="code-block">${escapeHtml(response.detail)}</pre>` : ""}
      </section>
    `;
  }

  return `
    <section class="result-panel" aria-labelledby="result-title">
      <div class="panel-head">
        <div>
          <h2 id="result-title">Model: ${escapeHtml(response.status)}</h2>
          <p class="story">${response.durationMs} ms · ${response.stats.variables} variables · ${
            response.stats.constraints
          } constraints</p>
        </div>
        <button class="secondary-button" type="button" data-copy-smt>Copy SMT-LIB</button>
      </div>
      <div class="result-grid">
        <div>
          ${renderAssignments(response)}
        </div>
        <div class="diagram-box" data-diagram aria-label="Mermaid solution diagram"></div>
      </div>
      <div>
        <h3>Explanation</h3>
        <p class="explanation" data-testid="explanation">${escapeHtml(state.explanation)}</p>
        <div class="llm-row">
          <input id="llm-endpoint" type="url" value="${escapeHtml(state.stored.llmEndpoint)}" aria-label="Local LLM endpoint" />
          <input id="llm-model" type="text" value="${escapeHtml(state.stored.llmModel)}" aria-label="Local LLM model" />
          <button class="secondary-button" type="button" data-ask-llm ${state.busy ? "disabled" : ""}>Ask local LLM</button>
        </div>
      </div>
      <details>
        <summary>SMT-LIB</summary>
        <pre class="code-block">${escapeHtml(response.smtlib)}</pre>
      </details>
    </section>
  `;
}

function renderAssignments(response: Extract<SolveResponse, { ok: true }>): string {
  if (response.assignments.length === 0) {
    return "<p>No assignments available.</p>";
  }

  return `
    <table class="solution-table" data-testid="solution-table">
      <thead><tr><th>Variable</th><th>Value</th></tr></thead>
      <tbody>
        ${response.assignments
          .map(
            (assignment) =>
              `<tr><td>${escapeHtml(assignment.label)}</td><td>${escapeHtml(assignment.value)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-puzzle-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const puzzle = state.puzzles.find((candidate) => candidate.id === button.dataset.puzzleId);
      if (puzzle) setSelected(puzzle);
    });
  });

  document.querySelector<HTMLButtonElement>("[data-solve]")?.addEventListener("click", () => {
    void solveSelected();
  });

  document.querySelector<HTMLButtonElement>("[data-ask-llm]")?.addEventListener("click", () => {
    void askLlm();
  });

  document.querySelector<HTMLButtonElement>("[data-copy-smt]")?.addEventListener("click", () => {
    if (state.response?.ok) {
      void navigator.clipboard.writeText(state.response.smtlib).then(() => showToast("SMT-LIB copied."));
    }
  });
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3600);
}

function escapeHtml(value: string | number | boolean): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

void boot();
