import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home page renders the club name and nav links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinema and Sins");
    await expect(page.getByRole("link", { name: "View Schedule" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse History" })).toBeVisible();
  });

  test("navbar links point at the expected routes", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "Schedule" })).toHaveAttribute(
      "href",
      "/schedule",
    );
    await expect(nav.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history",
    );
    await expect(nav.getByRole("link", { name: "Stats" })).toHaveAttribute(
      "href",
      "/stats",
    );
  });
});
