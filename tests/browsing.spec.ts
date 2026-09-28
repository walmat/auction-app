import { expect, test } from "@playwright/test";
import { createListing } from "./helpers/listings";

test("search, category, status, sort, and pagination remain in the URL and survive returning from a lot", async ({
	page,
	request,
}) => {
	await createListing(request, "Browse Deere Tractor", { startingPrice: 200 });
	await createListing(request, "Browse Case Tractor", { startingPrice: 100 });
	await createListing(request, "Browse Combine", { category: "combine" });
	await page.goto("/listings?pageSize=1");
	await page.getByRole("searchbox").fill("Browse");
	await expect(
		page.getByText("Showing 1–1 of 3", { exact: true }),
	).toBeVisible();
	await page.getByRole("button", { name: "Tractors", exact: true }).click();
	await page.getByRole("button", { name: "Active", exact: true }).click();
	await expect(
		page.getByText("Showing 1–1 of 2", { exact: true }),
	).toBeVisible();
	await page.getByRole("combobox", { name: "Sort auctions" }).click();
	await page.getByRole("option", { name: "Current bid: low to high" }).click();
	await expect(page.locator(".listing-card__title")).toHaveText(
		"Browse Case Tractor",
	);
	await page.getByRole("button", { name: "Next", exact: true }).click();
	await expect(page.locator(".listing-card__title")).toHaveText(
		"Browse Deere Tractor",
	);
	const listURL = page.url();
	const params = new URL(listURL).searchParams;
	expect(params.get("q")).toBe("Browse");
	expect(params.get("category")).toBe("tractor");
	expect(params.get("status")).toBe("active");
	expect(params.get("sort")).toBe("bid-lowest");
	expect(params.get("page")).toBe("2");
	await page.locator(".listing-card").click();
	await page.getByRole("link", { name: "← Back to lots" }).click();
	await expect(page).toHaveURL(listURL);
	await expect(page.getByRole("searchbox")).toHaveValue("Browse");
	await expect(page.locator(".listing-card__title")).toHaveText(
		"Browse Deere Tractor",
	);
});
