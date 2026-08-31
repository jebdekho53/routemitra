import { test, expect } from "@playwright/test";

test("feedback widget opens, validates, and submits", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /feedback/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // pick a type + type a message
  await dialog.getByRole("button", { name: /Something broke/ }).click();
  await dialog.getByLabel(/What would you like to tell us/).fill("E2E test: results load slow on 3G");
  await dialog.getByRole("button", { name: "Send", exact: true }).click();

  await expect(dialog.getByText(/Got it/)).toBeVisible();
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

  await page.getByLabel("Message").fill("E2E: will Kolkata routes be added?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(/reached us/)).toBeVisible();
});

test("admin dashboard + sub-pages are gated by basic auth", async ({
  request,
}) => {
  for (const path of [
    "/admin",
    "/admin/feedback",
    "/admin/traffic",
    "/admin/users",
    "/admin/system",
  ]) {
    const res = await request.get(path);
    expect([401, 503], `${path} should be gated`).toContain(res.status());
  }
});
