import { test, expect } from "@playwright/test";

test("feedback widget opens, validates, and submits", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Feedback/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // pick a type + type a message
  await dialog.getByRole("button", { name: /Kuch toota/ }).click();
  await dialog.getByLabel(/Kya kehna hai/).fill("E2E test: results load slow on 3G");
  await dialog.getByRole("button", { name: "Bhejo" }).click();

  await expect(dialog.getByText(/Mil gaya/)).toBeVisible();
});

test("help center renders FAQ accordion with JSON-LD", async ({ page }) => {
  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "Help Center" }),
  ).toBeVisible();

  const firstQ = page.locator(".faq details").first();
  await expect(firstQ).toBeVisible();
  await firstQ.locator("summary").click();
  await expect(firstQ.locator("p")).toBeVisible();

  expect(await page.content()).toContain('"@type":"FAQPage"');
});

test("contact page renders form and support channels", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "Contact & Support" }),
  ).toBeVisible();
  await expect(page.getByLabel("Message")).toBeVisible();
  await expect(page.getByText(/Grievance Officer/)).toBeVisible();

  await page.getByLabel("Message").fill("E2E: kya Kolkata routes aayenge?");
  await page.getByRole("button", { name: "Bhejo", exact: true }).click();
  await expect(page.getByText(/Mil gaya/)).toBeVisible();
});

test("admin dashboard is gated by basic auth", async ({ request }) => {
  const res = await request.get("/admin");
  expect([401, 503]).toContain(res.status());
});
