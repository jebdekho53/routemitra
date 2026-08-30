import { defineConfig, devices } from "@playwright/test";

// E2E_BASE_URL lets you point the suite at an already-running server on any
// port (e.g. a second `PORT=3100 npm run dev`) without touching the config.
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "android", use: { ...devices["Pixel 7"] } }, // Chromium mobile
    { name: "ios", use: { ...devices["iPhone 14"] } }, // WebKit — real Safari engine
    { name: "ios-small", use: { ...devices["iPhone SE"] } }, // 375px WebKit
  ],
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: process.env.CI ? "npm run start" : "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          // E2E runs on deterministic sample data. The live Duffel path
          // (and its rate limits) is covered by flight-duffel.test.ts.
          env: { DUFFEL_API_KEY: "" },
        },
      }),
});
