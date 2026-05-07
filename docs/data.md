# Data Contract

Mode A bundles puzzle data in source:

`src/features/puzzles/catalog.ts`

Schema version: `1`

Fields:

- `schemaVersion`: integer, currently `1`.
- `id`: stable kebab-case id.
- `title`: display title.
- `kind`: `logic-grid`, `schedule`, or `arithmetic`.
- `difficulty`: `beginner`, `intermediate`, or `expert`.
- `story`: puzzle prompt.
- `givens`: ordered clue strings.
- `variables`: displayed variable count.
- `constraints`: displayed approximate constraint count.
- `skill`: short solving concept label.

The catalog is validated with `zod` before the UI uses it. There is no generated data pipeline in v1.

Future large puzzle packs should move to versioned static JSON such as `/data/v2/puzzles.json` with sibling metadata.
