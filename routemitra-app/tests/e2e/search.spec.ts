import { test, expect } from "@playwright/test";

test("home -> search -> results -> book link", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Bus, train, flight/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /RouteMitra/ }).first(),
  ).toBeVisible();

  await page.getByLabel("From", { exact: true }).fill("Pune");
  await page.getByLabel("To", { exact: true }).fill("Bengaluru");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/\/search\?from=Pune&to=Bengaluru/);
  await expect(
    page.getByRole("heading", { name: "Pune → Bengaluru" }),
  ).toBeVisible();

  const cards = page.locator(".rc:not(.rc-skeleton)");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(1);

  // booking links carry tracking params — bus/train links go through the
  // Cuelinks affiliate wrapper (linksredirect.com), which percent-encodes
  // the whole original URL as a query value, so the literal "=" becomes
  // "%3D". Decode before asserting so this works both wrapped and not.
  const href = await page
    .getByRole("link", { name: /Book now/ })
    .first()
    .getAttribute("href");
  expect(decodeURIComponent(href ?? "")).toContain("utm_source=routemitra");
});

test("landing route card navigates to that route", async ({ page }) => {
  await page.goto("/");
  await page.locator(".route-card").first().click();
  await expect(page).toHaveURL(/\/routes\/[a-z-]+-to-[a-z-]+/);
  await expect(page.locator(".rc:not(.rc-skeleton)").first()).toBeVisible();
});

test("sort by fastest reorders results", async ({ page }) => {
  await page.goto("/search?from=Pune&to=Bengaluru");
  await expect(page.locator(".rc:not(.rc-skeleton)").first()).toBeVisible();

  const firstBefore = await page.locator(".rc:not(.rc-skeleton) .rc-operator").first().textContent();
  await page.getByRole("button", { name: "Fastest" }).click();
  const firstAfter = await page.locator(".rc:not(.rc-skeleton) .rc-operator").first().textContent();

  expect(firstAfter).not.toEqual(firstBefore);
});

test("unknown route shows empty state", async ({ page }) => {
  await page.goto("/search?from=Nowhere&to=Elsewhere");
  await expect(page.getByText(/No options found for this route/i)).toBeVisible();
});

test("ghar-se-ghar mode toggle reveals address fields and searches", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Door-to-door/ }).click();
  await expect(page.getByLabel("Full pickup address")).toBeVisible();
  await expect(page.getByLabel("Full drop-off address")).toBeVisible();

  await page.getByLabel("Full pickup address").fill("Indirapuram, Ghaziabad");
  await page.getByLabel("From city").fill("Delhi");
  await page.getByLabel("To city").fill("Varanasi");
  await page.getByLabel("Full drop-off address").fill("Lanka, Varanasi");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/origin=.+&destination=/);
  // the door-to-door mode is remembered on the results page
  await expect(page.getByLabel("Full pickup address")).toHaveValue(
    "Indirapuram, Ghaziabad",
  );
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
  await expect(page.getByRole("button", { name: /Create account/ })).toBeVisible();
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
