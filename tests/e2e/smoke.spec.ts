import { expect, test } from "@playwright/test";

test("loads, initializes Z3, solves a puzzle, and renders Mermaid", async ({
  page,
}) => {
  await page.goto(process.env.BASE_URL || "/", {
    waitUntil: "domcontentloaded",
  });

  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() => window.crossOriginIsolated);
        } catch {
          return false;
        }
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  await expect(
    page.getByRole("heading", { name: "Z3 SMT Game" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub repo" })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/z3-smt-game",
  );
  await expect(page.getByText(/v0\.1\.0/)).toBeVisible();

  await page.getByRole("button", { name: "Solve with Z3" }).click();
  await expect(page.getByTestId("solver-status")).toHaveText("sat", {
    timeout: 45_000,
  });
  await expect(page.getByTestId("solution-table")).toContainText("Ada room");
  await expect(page.locator("[data-diagram] svg")).toBeVisible();
  await expect(page.getByTestId("explanation")).toContainText(
    "Z3 found a satisfying model",
  );
});
