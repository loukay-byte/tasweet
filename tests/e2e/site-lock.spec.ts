import { expect, test } from "@playwright/test";
import { siteLogin } from "../../playwright.config";

// Plain fetch, so no credentials are ever sent (Playwright's own request
// client would answer the challenge with the configured password).
const bare = (path: string, baseURL: string | undefined) =>
  fetch(new URL(path, baseURL), { redirect: "manual" });

test.describe("without the password", () => {
  test("every page asks for credentials and asks not to be indexed", async ({ baseURL }) => {
    for (const path of ["/", "/ar", "/en/t/cinema-or-streaming", "/ar/submit"]) {
      const res = await bare(path, baseURL);
      expect(res.status, path).toBe(401);
      expect(res.headers.get("www-authenticate")).toContain("Basic");
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(await res.text()).not.toContain("صوتك");
    }
  });

  test("a wrong password is refused", async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      httpCredentials: { username: siteLogin.username, password: "wrong", send: "always" },
    });
    const res = await ctx.get("/ar");
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("robots.txt keeps search engines out while locked", async ({ baseURL }) => {
    const res = await bare("/robots.txt", baseURL);
    expect(await res.text()).toMatch(/Disallow: \/\s*$/m);
  });
});

test("the right password opens the site", async ({ page }) => {
  const res = await page.goto("/ar");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("banner").getByText("صوتك")).toBeVisible();
});
