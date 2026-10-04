import { expect, test } from "@playwright/test";

const tabs = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "Main navigation" });

test("the header and tab bar stay put while scrolling", async ({ page }) => {
  await page.goto("/en");
  const search = page.getByRole("banner").getByRole("link", { name: "Search" });
  const create = tabs(page).getByRole("link", { name: "Create question" });
  await page.mouse.wheel(0, 2000);
  await expect(search).toBeInViewport();
  await expect(create).toBeInViewport();
});

test("the homepage hero is a ballot you can vote on", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("Question of the Day")).toBeVisible();
  await page.getByTestId("vote-card").getByRole("button", { name: "Saturday–Sunday" }).click();
  await expect(page.getByText(/what % do you think chose/)).toBeVisible();
});

test("tabs move between home, results, create, and account", async ({ page }) => {
  await page.goto("/en");
  await tabs(page).getByRole("link", { name: "Results" }).click();
  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(tabs(page).getByRole("link", { name: "Results" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("img", { name: "Yes 33%, No 67%" })).toBeVisible();
  await tabs(page).getByRole("link", { name: "Account" }).click();
  await expect(page.getByRole("heading", { name: "Sign-in is coming soon" })).toBeVisible();
});

test("the header search icon opens Explore with the search box focused", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("banner").getByRole("link", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/en\/explore$/);
  await expect(page.getByRole("searchbox")).toBeFocused();
});

test("the menu searches and filters by category", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await menu.getByRole("link", { name: "Gaming" }).click();
  await expect(page).toHaveURL(/explore\?c=gaming/);
  await expect(page.getByText("1 topic")).toBeVisible();
  await expect(menu).toBeHidden();
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

test("the language toggle keeps you on the same page", async ({ page }) => {
  await page.goto("/en/results");
  await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "العربية" }).click();
  await expect(page).toHaveURL(/\/ar\/results$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("creating a question sends it for review", async ({ page }) => {
  await page.goto("/en");
  await tabs(page).getByRole("link", { name: "Create question" }).click();
  await expect(page).toHaveURL(/\/en\/submit$/);

  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Choose a category for the topic.");

  await page.getByLabel("Question").fill("Do you prefer travelling in summer or in winter?");
  await page.getByLabel("First option").fill("Summer");
  await page.getByLabel("Second option").fill("Winter");
  await page.locator("form").getByText("Social", { exact: true }).click();
  await page.getByRole("button", { name: "Send for review" }).click();

  await expect(page.getByRole("heading", { name: "Sent for review" })).toBeVisible();
});
