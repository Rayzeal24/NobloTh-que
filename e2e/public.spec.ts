import { expect, test } from "@playwright/test";

test("la page d’accueil mène à l’inscription", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible();
  await expect.poll(() => page.locator('img[src="/logo.svg"]').first().evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: /Vos histoires/ })).toBeVisible();
  await page.getByRole("link", { name: "Créer ma bibliothèque" }).click();
  await expect(page).toHaveURL(/inscription/);
  await expect(page.getByRole("heading", { name: "Créez votre bibliothèque" })).toBeVisible();
});
