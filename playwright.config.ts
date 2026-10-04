import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a local Supabase (`npx supabase start`)
// with the seed data loaded (`npx supabase db reset`).
const port = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://127.0.0.1:${port}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
