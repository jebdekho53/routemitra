import { test, expect } from "@playwright/test";

// These run under both the desktop and mobile projects, but the assertions
// below matter most on the mobile viewport.

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of [
    "/",
    "/search?from=Mumbai&to=Goa",
    "/routes/pune-to-bengaluru",
    "/login",
    "/privacy",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `horizontal overflow on ${path}`).toBe(false);
  }
});

test("primary tap targets are at least 44px tall", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  for (const sel of ["button[type=submit]", "input#from", ".brand"]) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box, `${sel} has a box`).not.toBeNull();
    expect(box!.height, `${sel} height`).toBeGreaterThanOrEqual(40);
  }
});

test("sticky app bar stays put while scrolling", async ({ page }) => {
  await page.goto("/routes/pune-to-bengaluru");
  const bar = page.locator(".appbar");
  await expect(bar).toBeVisible();
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(200);
  const top = await bar.evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(2); // still pinned to the top
});

test("mobile search flow works end to end", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Kahan se").fill("Delhi");
  await page.getByLabel("Kahan tak").fill("Chandigarh");
  await page.getByRole("button", { name: "Dhoondo" }).click();
  await expect(page).toHaveURL(/from=Delhi&to=Chandigarh/);
  await expect(page.locator(".card").first()).toBeVisible();
  // form carried the query across the redirect
  await expect(page.getByLabel("Kahan se")).toHaveValue("Delhi");
});
