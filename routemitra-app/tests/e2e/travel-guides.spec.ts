import { test, expect } from "@playwright/test";

test("door-to-door guide page renders with content + JSON-LD", async ({
  page,
}) => {
  const res = await page.goto("/travel/mumbai-to-goa");
  expect(res?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { name: "Mumbai to Goa", exact: true }),
  ).toBeVisible();
  // quick-answer box + options table both mention door-to-door
  await expect(page.locator(".guide-answer")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: /Door-to-door/ })).toBeVisible();
  // mode-by-mode breakdown
  await expect(page.getByText("Door-to-door, mode by mode")).toBeVisible();
  // FAQ JSON-LD present in the HTML
  expect(await page.content()).toContain('"@type":"FAQPage"');
  // cross-links to the live comparison
  await expect(
    page.getByRole("link", { name: /Mumbai .* Goa: live prices/ }),
  ).toBeVisible();
});

test("guide links from the routes page and homepage", async ({ page }) => {
  await page.goto("/routes/delhi-to-jaipur");
  await page.getByRole("link", { name: /door-to-door guide/ }).click();
  await expect(page).toHaveURL(/\/travel\/delhi-to-jaipur/);
});

test("bad guide slug is 404", async ({ page }) => {
  const res = await page.goto("/travel/nowhere-to-elsewhere");
  expect(res?.status()).toBe(404);
});

test("sitemap includes travel guides", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  const body = await res.text();
  expect(body).toContain("/travel/mumbai-to-goa");
});
