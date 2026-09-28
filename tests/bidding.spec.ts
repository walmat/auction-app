import { expect, test } from "@playwright/test";
import { createListing } from "./helpers/listings";

test("a bid updates other viewers and the grid without erasing in-progress input", async ({
	page,
	context,
	request,
}) => {
	const listing = await createListing(request, "Live bidding tractor");
	const viewer = await context.newPage();
	const grid = await context.newPage();
	await page.goto(`/listings/${listing.id}`);
	await viewer.goto(`/listings/${listing.id}`);
	await grid.goto("/listings?q=Live%20bidding%20tractor");
	await expect(page.getByText("No bids yet", { exact: true })).toBeVisible();
	await viewer.getByLabel("Your Name").fill("Alex");
	await viewer.getByLabel("Bid Amount ($)").fill("350");
	await page.getByLabel("Your Name").fill("Jane");
	await page.getByLabel("Bid Amount ($)").fill("200");
	await page.getByRole("button", { name: "Submit Bid" }).click();
	await expect(page.getByLabel("Your Name")).toHaveValue("");
	await expect(viewer.locator(".auction-panel__price strong")).toHaveText(
		"$200",
	);
	await expect(viewer.locator(".bid-history__row")).toContainText("Jane");
	await expect(grid.locator(".listing-card__bid strong")).toHaveText("$200");
	await expect(viewer.getByLabel("Your Name")).toHaveValue("Alex");
	await expect(viewer.getByLabel("Bid Amount ($)")).toHaveValue("350");
});

test("the detail form and grid close at the deadline without a reload", async ({
	page,
	context,
	request,
}) => {
	const listing = await createListing(request, "Closing tractor", {
		endsAt: new Date(Date.now() + 4000).toISOString(),
	});
	const grid = await context.newPage();
	await page.goto(`/listings/${listing.id}`);
	await grid.goto("/listings?q=Closing%20tractor");
	await expect(page.getByRole("button", { name: "Submit Bid" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Submit Bid" })).toHaveCount(
		0,
		{ timeout: 7000 },
	);
	await expect(page.getByText("Bidding closed", { exact: true })).toBeVisible();
	await expect(grid.locator(".listing-card__time")).toHaveText("Ended");
});

test("bid history pages newest bids first and can return to newer bids", async ({
	page,
	request,
}) => {
	const listing = await createListing(request, "History tractor");
	for (let i = 1; i <= 11; i++) {
		const response = await request.post(`/api/listings/${listing.id}/bids`, {
			data: { bidder: `Bidder ${i}`, amount: 100 + i * 10 },
		});
		expect(response.status()).toBe(201);
	}
	await page.goto(`/listings/${listing.id}`);
	await expect(page.locator(".bid-history__row")).toHaveCount(10);
	await expect(page.locator(".bid-history__row").first()).toContainText(
		"Bidder 11",
	);
	await page.getByRole("button", { name: "Older", exact: true }).click();
	await expect(page.locator(".bid-history__row")).toHaveCount(1);
	await expect(page.locator(".bid-history__row")).toContainText("Bidder 1");
	await expect(
		page.getByRole("button", { name: "Older", exact: true }),
	).toBeDisabled();
	await page.getByRole("button", { name: "Newer", exact: true }).click();
	await expect(page.locator(".bid-history__row")).toHaveCount(10);
});
