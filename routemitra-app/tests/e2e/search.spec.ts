import { test, expect } from "@playwright/test";

test("home -> search -> results -> book link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "RouteMitra" })).toBeVisible();

  await page.getByLabel("Kahan se").fill("Pune");
  await page.getByLabel("Kahan tak").fill("Bengaluru");
  await page.getByRole("button", { name: "Dhoondo" }).click();

  await expect(page).toHaveURL(/\/search\?from=Pune&to=Bengaluru/);
  await expect(
    page.getByRole("heading", { name: "Pune → Bengaluru" }),
  ).toBeVisible();

  const cards = page.locator(".card").filter({ hasNot: page.locator(".card-skeleton") });
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(1);

  // booking links carry tracking params
  const href = await page
    .getByRole("link", { name: /Book karein/ })
    .first()
    .getAttribute("href");
  expect(href).toContain("utm_source=routemitra");
});

test("sort by fastest reorders results", async ({ page }) => {
  await page.goto("/search?from=Pune&to=Bengaluru");
  await expect(page.locator(".card").first()).toBeVisible();

  const firstBefore = await page.locator(".card .operator").first().textContent();
  await page.getByRole("button", { name: "Sabse tez" }).click();
  const firstAfter = await page.locator(".card .operator").first().textContent();

  expect(firstAfter).not.toEqual(firstBefore);
});

test("unknown route shows empty state", async ({ page }) => {
  await page.goto("/search?from=Nowhere&to=Elsewhere");
  await expect(page.getByText(/koi option nahi mila/i)).toBeVisible();
});

test("static route page renders server-side with content", async ({ page }) => {
  const res = await page.goto("/routes/pune-to-bengaluru");
  expect(res?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Pune → Bengaluru" }),
  ).toBeVisible();
  // JSON-LD FAQ present in the HTML
  expect(await page.content()).toContain('"@type":"FAQPage"');
});

test("404 page for a bad route slug", async ({ page }) => {
  const res = await page.goto("/routes/not-a-real-route");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("404")).toBeVisible();
});

test("login and signup pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("button", { name: /Account banao/ })).toBeVisible();
});

test("protected routes redirect to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?callbackUrl=\/dashboard/);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?callbackUrl=\/account/);
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
});

test("health endpoint responds", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBe(true);
  expect((await res.json()).ok).toBe(true);
});
