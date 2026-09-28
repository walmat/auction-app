import { expect, test } from "@playwright/test";
import { fillListingForm, photoFile } from "./helpers/listings";

for (const width of [1440, 390]) {
	test(`create a listing at ${width}px with validation, draft recovery, photos, and publishing`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/listings/new");
		await page.getByRole("button", { name: "Publish listing" }).click();
		await expect(page.getByLabel("Listing title")).toBeFocused();
		await expect(page.getByLabel("Category", { exact: true })).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await fillListingForm(page, `Creation test ${width}`);
		await page
			.locator("#create-photos")
			.setInputFiles([
				await photoFile(page, "green"),
				await photoFile(page, "blue"),
			]);
		await expect(page.locator(".create-photo img")).toHaveCount(2);
		await page.getByRole("button", { name: "Make cover" }).click();
		const cover = await page
			.getByAltText("Equipment view 1")
			.getAttribute("src");
		await page.reload();
		await expect(page.getByLabel("Listing title")).toHaveValue(
			`Creation test ${width}`,
		);
		await expect(page.getByAltText("Equipment view 1")).toHaveAttribute(
			"src",
			cover ?? "",
		);
		if (width < 900) {
			await expect(page.locator(".create-preview details")).not.toHaveAttribute(
				"open",
			);
			await page.getByText("Preview listing", { exact: true }).click();
		}
		await expect(page.getByAltText("Listing cover preview")).toHaveAttribute(
			"src",
			cover ?? "",
		);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		).toBe(true);
		await page.getByRole("button", { name: "Publish listing" }).click();
		await expect(
			page.getByRole("heading", {
				name: `Creation test ${width}`,
				exact: true,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Auction details" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "View photo 1" }),
		).toHaveAttribute("aria-pressed", "true");
		await page.getByRole("button", { name: "View photo 2" }).click();
		await expect(
			page.getByRole("button", { name: "View photo 2" }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			await page.evaluate(() =>
				localStorage.getItem("auction-listing-draft-v1"),
			),
		).toBeNull();
	});
}

test("a failed publish preserves entries and allows retry", async ({
	page,
}) => {
	await page.goto("/listings/new");
	await fillListingForm(page, "Retry creation test");
	await page.route("**/api/listings", (route) =>
		route.request().method() === "POST"
			? route.fulfill({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify({ error: "Could not publish. Try again." }),
				})
			: route.continue(),
	);
	await page.getByRole("button", { name: "Publish listing" }).click();
	await expect(page.getByRole("alert")).toHaveText(
		"Could not publish. Try again.",
	);
	await expect(page.getByLabel("Listing title")).toHaveValue(
		"Retry creation test",
	);
	await expect(page.getByLabel("Starting bid (USD)")).toHaveValue("2500.50");
	await page.unroute("**/api/listings");
	await page.getByRole("button", { name: "Publish listing" }).click();
	await expect(
		page.getByRole("heading", { name: "Retry creation test", exact: true }),
	).toBeVisible();
});
