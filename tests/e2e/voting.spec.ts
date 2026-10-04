import { expect, test, type Page } from "@playwright/test";

// Seed topics from supabase/seed.sql.
const OPEN = "/t/cinema-or-streaming";
const CLOSED = "/t/cashless-payments";

async function swipe(page: Page, dx: number) {
  const card = page.getByTestId("vote-card");
  const box = (await card.boundingBox())!;
  const y = box.y + box.height / 2;
  const x = box.x + box.width / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x + (dx * i) / 10, y);
  await page.mouse.up();
}

test.describe("Arabic browser", () => {
  test.use({ locale: "ar-SA" });

  test("root redirects to Arabic and renders right-to-left", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByText("سؤال اليوم")).toBeVisible();
    await expect(page.getByText(/يصوّتون الآن/)).toBeVisible();
  });
});

test("an English browser is sent to English", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("results stay hidden until you vote, then tap, guess, and see results", async ({ page }) => {
  await page.goto(`/en${OPEN}`);
  await expect(page.getByTestId("vote-card")).toBeVisible();
  await expect(page.getByText(/\d+%/)).toHaveCount(0);

  await page.getByRole("button", { name: "Cinema" }).click();

  await expect(page.getByText(/what % do you think chose “Cinema”/)).toBeVisible();
  await page.getByLabel(/what % do you think/).fill("70");
  await page.getByRole("button", { name: "Cost" }).click();
  await page.getByRole("button", { name: "Show the result" }).click();

  const cinemaRow = page.getByRole("listitem").filter({ hasText: "Cinema" });
  await expect(cinemaRow.getByText("Your vote")).toBeVisible();
  await expect(page.getByText(/You guessed \u206670%\u2069/)).toBeVisible();
  await expect(page.getByText(/You can change your vote after/)).toBeVisible();

  // Reloading keeps the vote (same anonymous session).
  await page.reload();
  await expect(cinemaRow.getByText("Your vote")).toBeVisible();
});

test("swiping toward the start side picks option A in Arabic (RTL)", async ({ page }) => {
  await page.goto(`/ar${OPEN}`);
  await expect(page.getByTestId("vote-card")).toBeVisible();
  await swipe(page, 200); // right = start in RTL
  await expect(page.getByText(/كم نسبة من اختاروا «السينما»/)).toBeVisible();
  await page.getByRole("button", { name: "تخطَّ" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "السينما" }).getByText("صوتك")).toBeVisible();
});

test("swiping right picks option B in English (LTR)", async ({ page }) => {
  await page.goto(`/en${OPEN}`);
  await expect(page.getByTestId("vote-card")).toBeVisible();
  await swipe(page, 200);
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Streaming" }).getByText("Your vote")).toBeVisible();
});

test("closed topics show final results without voting", async ({ page }) => {
  await page.goto(`/en${CLOSED}`);
  await expect(page.getByText(/Voting on this topic has ended/)).toBeVisible();
  await expect(page.getByTestId("vote-card")).toHaveCount(0);
  await expect(page.getByRole("listitem").filter({ hasText: "Yes" })).toContainText("33%");
  await expect(page.getByRole("listitem").filter({ hasText: "No" })).toContainText("67%");
});

test("unknown topics return 404", async ({ page }) => {
  const res = await page.goto("/en/t/does-not-exist");
  expect(res?.status()).toBe(404);
});
