import { expect, test } from "@playwright/test";

test("the suggest button stays in the header while scrolling", async ({ page }) => {
  await page.goto("/en");
  const suggest = page.getByRole("banner").getByRole("link", { name: "Suggest a topic" });
  await expect(suggest).toBeInViewport();
  await page.mouse.wheel(0, 2000);
  await expect(suggest).toBeInViewport();
});

test("the homepage hero is a ballot you can vote on", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("Question of the Day")).toBeVisible();
  await page.getByTestId("vote-card").getByRole("button", { name: "Saturday–Sunday" }).click();
  await expect(page.getByText(/what % do you think chose/)).toBeVisible();
});

test("bottom tabs move between home, explore, and results", async ({ page }) => {
  await page.goto("/en");
  const tabs = page.getByRole("navigation", { name: "Home" }).last();
  await tabs.getByRole("link", { name: "Explore" }).click();
  await expect(page).toHaveURL(/\/en\/explore$/);
  await expect(tabs.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
  await tabs.getByRole("link", { name: "Results" }).click();
  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(page.getByRole("img", { name: "Yes 33%, No 67%" })).toBeVisible();
});

test("search ignores Arabic spelling variants and diacritics", async ({ page }) => {
  await page.goto("/ar/explore");
  // Seed question uses تفضّل (with shadda) and ة; search without either.
  await page.getByRole("searchbox").fill("الافلام الجديده");
  await page.getByRole("searchbox").press("Enter");
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByText("موضوع واحد")).toBeVisible();
  await expect(page.getByText("أين تفضّل مشاهدة الأفلام الجديدة؟")).toBeVisible();
});

test("category chips filter topics", async ({ page }) => {
  await page.goto("/en/explore");
  await page.getByRole("link", { name: "Gaming", exact: true }).click();
  await expect(page).toHaveURL(/c=gaming/);
  await expect(page.getByText("1 topic")).toBeVisible();
  await expect(page.getByText("Should esports be offered as a school activity?")).toBeVisible();
});

test("suggesting a topic sends it for review", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: "Suggest a topic" }).click();
  await expect(page).toHaveURL(/\/en\/submit$/);

  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Choose a category for the topic.");

  await page.getByLabel("Question").fill("Do you prefer travelling in summer or in winter?");
  await page.getByLabel("First option").fill("Summer");
  await page.getByLabel("Second option").fill("Winter");
  await page.getByText("Social", { exact: true }).click();
  await page.getByRole("button", { name: "Send for review" }).click();

  await expect(page.getByRole("heading", { name: "Sent for review" })).toBeVisible();
});
