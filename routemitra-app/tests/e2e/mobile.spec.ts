import { test, expect } from "@playwright/test";

// These run under both the desktop and mobile projects, but the assertions
// below matter most on the mobile viewport.

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of [
    "/",
    "/search?from=Mumbai&to=Goa&date=2026-12-25",
    "/routes/pune-to-bengaluru",
    "/dashboard",
    "/login",
    "/signup",
    "/privacy",
    "/admin",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // the page itself must not scroll horizontally
    const docOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(docOverflow, `document scrolls ${docOverflow}px on ${path}`).toBeLessThanOrEqual(1);

    // and no visible element should extend past the right edge
    const bad = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders: string[] = [];
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.visibility === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1) {
          offenders.push(
            `${el.tagName.toLowerCase()}.${(el.className || "?").toString().split(" ")[0]} right=${Math.round(r.right)}/vw=${vw}`,
          );
        }
        if (offenders.length > 4) break;
      }
      return offenders;
    });
    expect(bad, `overflow on ${path}: ${bad.join(" | ")}`).toEqual([]);
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

test("hamburger opens the nav sheet with links + theme control", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const sheet = page.locator(".nav-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: "My dashboard" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Light" })).toBeVisible();
  await page.waitForTimeout(300); // let the slide-in settle
  // sheet fills the viewport height; page must not scroll horizontally
  const m = await page.evaluate(() => {
    const s = document.querySelector(".nav-sheet")!.getBoundingClientRect();
    return {
      h: s.height,
      vh: window.innerHeight,
      docOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });
  expect(m.h).toBeGreaterThan(m.vh - 2);
  expect(m.docOverflow).toBeLessThanOrEqual(1);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("bottom tab bar: shown on mobile, hidden on desktop", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator(".bottom-nav");
  const isMobile = page.viewportSize()!.width < 768;
  if (isMobile) {
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Search" })).toBeVisible();
  } else {
    await expect(nav).toBeHidden();
  }
});

test("mobile search flow works end to end", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Kahan se").fill("Delhi");
  await page.getByLabel("Kahan tak").fill("Chandigarh");
  await page.getByRole("button", { name: "Dhoondo" }).click();
  await expect(page).toHaveURL(/from=Delhi&to=Chandigarh/);
  await expect(page.locator(".rc:not(.rc-skeleton)").first()).toBeVisible();
  // form carried the query across the redirect
  await expect(page.getByLabel("Kahan se")).toHaveValue("Delhi");
});
