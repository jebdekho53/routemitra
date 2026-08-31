import { test, expect } from "@playwright/test";

test("resume-booking bar appears after a Book click and clears on Done", async ({
  page,
}) => {
  await page.goto("/search?from=Mumbai&to=Goa");
  await expect(page.locator(".rc:not(.rc-skeleton)").first()).toBeVisible();

  // clicking "Book now" opens a new tab; capture and close it
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Book now/ }).first().click(),
  ]);
  await popup.close();

  // back on the RouteMitra tab the resume bar shows what we were booking
  const bar = page.locator(".resume-bar");
  await expect(bar).toBeVisible();
  await expect(bar).toContainText("Mumbai → Goa");
  await expect(bar.getByRole("link", { name: /Open again/ })).toBeVisible();

  // it survives navigation
  await page.goto("/");
  await expect(page.locator(".resume-bar")).toBeVisible();

  // "Done" dismisses it for good
  await page.locator(".resume-bar").getByRole("button", { name: "Done" }).click();
  await expect(page.locator(".resume-bar")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".resume-bar")).toHaveCount(0);
});
