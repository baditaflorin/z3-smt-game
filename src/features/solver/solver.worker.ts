import { expose } from "comlink";

import type { Arith, Bool, Context, Model } from "z3-solver";
import type * as Z3BrowserModule from "z3-solver/build/browser";
import z3ScriptUrl from "z3-solver/build/z3-built.js?url";
import z3WasmUrl from "z3-solver/build/z3-built.wasm?url";

import type { SolverApi, SolveRequest, SolveResponse } from "./types";

type GameContext = Context<"game">;
type IntExpr = Arith<"game">;
type BoolExpr = Bool<"game">;
type GameModel = Model<"game">;
type Z3Api = Awaited<ReturnType<typeof Z3BrowserModule.init>>;

type EncoderOutput = {
  solver: InstanceType<GameContext["Solver"]>;
  ctx: GameContext;
  variables: Record<string, IntExpr>;
  labels: Record<string, { label: string; group: string; format?: (value: number) => string }>;
  diagram: (assignments: Record<string, number>) => string;
  facts: string[];
  constraints: number;
};

declare global {
  var initZ3: unknown;
}

let z3Promise: Promise<Z3Api> | undefined;

const localInitZ3 = async (): Promise<Z3Api> => {
  if (!z3Promise) {
    z3Promise = (async () => {
      if (typeof globalThis.initZ3 !== "function") {
        const source = await fetch(z3ScriptUrl).then((response) => {
          if (!response.ok) {
            throw new Error(`Could not load Z3 script: ${response.status}`);
          }
          return response.text();
        });
        globalThis.eval(`${source}\n;globalThis.initZ3 = initZ3;`);
      }

      const rawInitZ3 = globalThis.initZ3;
      if (typeof rawInitZ3 !== "function") {
        throw new Error("Z3 browser initializer is unavailable.");
      }

      globalThis.initZ3 = () =>
        rawInitZ3({
          locateFile: (path: string) => (path.endsWith(".wasm") ? z3WasmUrl : z3ScriptUrl),
          mainScriptUrlOrBlob: z3ScriptUrl
        });

      const { init } = await import("z3-solver/build/browser.js");
      return init();
    })();
  }

  return z3Promise;
};

function domain(ctx: GameContext, value: IntExpr, min: number, max: number): BoolExpr[] {
  return [value.ge(min), value.le(max)];
}

function exactlyOneOf(ctx: GameContext, value: IntExpr, allowed: number[]): BoolExpr {
  return ctx.Or(...allowed.map((candidate) => value.eq(candidate)));
}

function addAllDifferent(ctx: GameContext, solver: InstanceType<GameContext["Solver"]>, values: IntExpr[]): void {
  solver.add(ctx.Distinct(...values));
}

function intValue(ctx: GameContext, model: GameModel, expr: IntExpr): number {
  const value = model.eval(expr, true);
  if (ctx.isIntVal(value)) {
    return Number(value.value());
  }

  const parsed = Number.parseInt(value.toString(), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Model value is not an integer: ${value.toString()}`);
  }
  return parsed;
}

function encodeMansion(z3: Z3Api): EncoderOutput {
  const ctx = new z3.Context("game");
  const { Solver, Int } = ctx;
  const solver = new Solver();
  const variables = {
    adaRoom: Int.const("ada_room"),
    brunoRoom: Int.const("bruno_room"),
    coraRoom: Int.const("cora_room"),
    adaItem: Int.const("ada_item"),
    brunoItem: Int.const("bruno_item"),
    coraItem: Int.const("cora_item")
  };
  const rooms = [variables.adaRoom, variables.brunoRoom, variables.coraRoom];
  const items = [variables.adaItem, variables.brunoItem, variables.coraItem];

  for (const variable of [...rooms, ...items]) {
    solver.add(...domain(ctx, variable, 1, 3));
  }
  addAllDifferent(ctx, solver, rooms);
  addAllDifferent(ctx, solver, items);

  solver.add(variables.brunoRoom.eq(3));
  solver.add(variables.adaItem.eq(1));
  solver.add(variables.coraRoom.neq(1));
  solver.add(variables.brunoItem.eq(3));
  solver.add(
    ctx.Or(
      ctx.And(variables.adaRoom.eq(2), variables.adaItem.eq(2)),
      ctx.And(variables.brunoRoom.eq(2), variables.brunoItem.eq(2)),
      ctx.And(variables.coraRoom.eq(2), variables.coraItem.eq(2))
    )
  );

  return {
    solver,
    ctx,
    variables,
    labels: {
      adaRoom: { label: "Ada room", group: "Rooms", format: roomName },
      brunoRoom: { label: "Bruno room", group: "Rooms", format: roomName },
      coraRoom: { label: "Cora room", group: "Rooms", format: roomName },
      adaItem: { label: "Ada artifact", group: "Artifacts", format: itemName },
      brunoItem: { label: "Bruno artifact", group: "Artifacts", format: itemName },
      coraItem: { label: "Cora artifact", group: "Artifacts", format: itemName }
    },
    diagram: mansionDiagram,
    facts: [
      "Two all-different sets interact: each room and each artifact can be used once.",
      "The Library-Key clue links two domains, so assigning a room immediately constrains an artifact.",
      "Z3 prunes the grid by propagating equalities before it has to search."
    ],
    constraints: 15
  };
}

function encodeLineup(z3: Z3Api): EncoderOutput {
  const ctx = new z3.Context("game");
  const { Solver, Int } = ctx;
  const solver = new Solver();
  const variables = {
    axioms: Int.const("axioms"),
    boards: Int.const("boards"),
    circuits: Int.const("circuits"),
    demos: Int.const("demos"),
    encoding: Int.const("encoding")
  };
  const talks = Object.values(variables);

  for (const variable of talks) {
    solver.add(...domain(ctx, variable, 1, 5));
  }
  addAllDifferent(ctx, solver, talks);
  solver.add(variables.boards.eq(variables.demos.add(1)));
  solver.add(variables.circuits.eq(3));
  solver.add(variables.encoding.gt(variables.axioms));
  solver.add(variables.demos.gt(variables.circuits));
  solver.add(variables.encoding.gt(1), variables.encoding.lt(5));

  return {
    solver,
    ctx,
    variables,
    labels: {
      axioms: { label: "Axioms", group: "Talks", format: slotName },
      boards: { label: "Boards", group: "Talks", format: slotName },
      circuits: { label: "Circuits", group: "Talks", format: slotName },
      demos: { label: "Demos", group: "Talks", format: slotName },
      encoding: { label: "Encoding", group: "Talks", format: slotName }
    },
    diagram: lineupDiagram,
    facts: [
      "The adjacency clue creates a tight pair, so moving Demos automatically moves Boards.",
      "All-different turns every slot choice into exclusions for the other talks.",
      "The third-slot anchor lets Z3 propagate order constraints before branching."
    ],
    constraints: 18
  };
}

function encodeCrates(z3: Z3Api): EncoderOutput {
  const ctx = new z3.Context("game");
  const { Solver, Int } = ctx;
  const solver = new Solver();
  const variables = {
    red: Int.const("red"),
    blue: Int.const("blue"),
    green: Int.const("green")
  };
  const crates = Object.values(variables);

  for (const variable of crates) {
    solver.add(...domain(ctx, variable, 1, 9));
  }
  addAllDifferent(ctx, solver, crates);
  solver.add(variables.red.add(variables.blue).eq(10));
  solver.add(variables.green.eq(variables.red.add(2)));
  solver.add(variables.blue.gt(variables.green));
  solver.add(exactlyOneOf(ctx, variables.red, [1, 3, 5, 7, 9]));
  solver.add(variables.blue.lt(8));

  return {
    solver,
    ctx,
    variables,
    labels: {
      red: { label: "Red crate", group: "Weights", format: kilogramName },
      blue: { label: "Blue crate", group: "Weights", format: kilogramName },
      green: { label: "Green crate", group: "Weights", format: kilogramName }
    },
    diagram: crateDiagram,
    facts: [
      "The domain is finite, but the arithmetic equalities cut through it faster than enumeration.",
      "Oddness is encoded as a small disjunction, a classic SAT-style choice inside an integer problem.",
      "The less-than clue removes the lighter branch and leaves a single model."
    ],
    constraints: 17
  };
}

function roomName(value: number): string {
  return ["", "Atrium", "Library", "Workshop"][value] ?? `Room ${value}`;
}

function itemName(value: number): string {
  return ["", "Map", "Key", "Lens"][value] ?? `Artifact ${value}`;
}

function slotName(value: number): string {
  return `Slot ${value}`;
}

function kilogramName(value: number): string {
  return `${value} kg`;
}

function mansionDiagram(assignments: Record<string, number>): string {
  const people = ["ada", "bruno", "cora"] as const;
  const label = (person: (typeof people)[number]) => person[0].toUpperCase() + person.slice(1);
  const edges = people
    .flatMap((person) => [
      `${label(person)} --> ${roomName(assignments[`${person}Room`]).replaceAll(" ", "")}`,
      `${label(person)} --> ${itemName(assignments[`${person}Item`]).replaceAll(" ", "")}`
    ])
    .join("\n");

  return `flowchart LR
${edges}
classDef person fill:#f6f3e7,stroke:#15251f,color:#15251f
classDef room fill:#d8efe8,stroke:#2c6f62,color:#12332d
classDef item fill:#ffe1bd,stroke:#b56a22,color:#3f2712
class Ada,Bruno,Cora person
class Atrium,Library,Workshop room
class Map,Key,Lens item`;
}

function lineupDiagram(assignments: Record<string, number>): string {
  const order = Object.entries({
    Axioms: assignments.axioms,
    Boards: assignments.boards,
    Circuits: assignments.circuits,
    Demos: assignments.demos,
    Encoding: assignments.encoding
  }).sort((left, right) => left[1] - right[1]);

  return `flowchart LR
${order.map(([talk], index) => `S${index + 1}["${index + 1}. ${talk}"]`).join(" --> ")}
classDef slot fill:#f6f3e7,stroke:#15251f,color:#15251f
class S1,S2,S3,S4,S5 slot`;
}

function crateDiagram(assignments: Record<string, number>): string {
  return `flowchart LR
Red["Red ${assignments.red} kg"] --> Sum["Red + Blue = 10"]
Blue["Blue ${assignments.blue} kg"] --> Sum
Red --> Green["Green ${assignments.green} kg"]
Green --> Compare["Blue > Green"]
Blue --> Compare
classDef crate fill:#f6f3e7,stroke:#15251f,color:#15251f
classDef clue fill:#d8efe8,stroke:#2c6f62,color:#12332d
class Red,Blue,Green crate
class Sum,Compare clue`;
}

function encoderFor(puzzleId: string, z3: Z3Api): EncoderOutput {
  if (puzzleId === "mansion-logic-grid") return encodeMansion(z3);
  if (puzzleId === "studio-lineup") return encodeLineup(z3);
  if (puzzleId === "crate-weights") return encodeCrates(z3);
  throw new Error(`Unknown puzzle id: ${puzzleId}`);
}

async function solve(request: SolveRequest): Promise<SolveResponse> {
  const started = performance.now();

  try {
    const z3 = await localInitZ3();
    const encoded = encoderFor(request.puzzleId, z3);
    const status = await encoded.solver.check();
    const durationMs = Math.round(performance.now() - started);

    if (status !== "sat") {
      return {
        ok: true,
        puzzleId: request.puzzleId,
        status,
        durationMs,
        assignments: [],
        diagram: "flowchart LR\nNoModel[\"No satisfying model\"]",
        smtlib: encoded.solver.toSmtlib2(status),
        model: "",
        difficultyFacts: encoded.facts,
        stats: { variables: Object.keys(encoded.variables).length, constraints: encoded.constraints }
      };
    }

    const model = encoded.solver.model();
    const rawAssignments = Object.fromEntries(
      Object.entries(encoded.variables).map(([key, expr]) => [key, intValue(encoded.ctx, model, expr)])
    );
    const assignments = Object.entries(encoded.labels).map(([key, meta]) => {
      const value = rawAssignments[key];
      return {
        label: meta.label,
        group: meta.group,
        value: meta.format ? meta.format(value) : String(value)
      };
    });

    return {
      ok: true,
      puzzleId: request.puzzleId,
      status,
      durationMs,
      assignments,
      diagram: encoded.diagram(rawAssignments),
      smtlib: encoded.solver.toSmtlib2(status),
      model: model.sexpr(),
      difficultyFacts: encoded.facts,
      stats: { variables: Object.keys(encoded.variables).length, constraints: encoded.constraints }
    };
  } catch (error) {
    return {
      ok: false,
      puzzleId: request.puzzleId,
      status: "error",
      durationMs: Math.round(performance.now() - started),
      message: error instanceof Error ? error.message : "Unexpected solver failure.",
      detail: error instanceof Error ? error.stack : undefined
    };
  }
}

const api: SolverApi = {
  solve,
  async warm() {
    await localInitZ3();
    return { isolated: globalThis.crossOriginIsolated };
  }
};

expose(api);
