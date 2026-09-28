import { type APIRequestContext, expect, type Page } from "@playwright/test";
import type { Listing } from "../../shared/types";

export async function createListing(
	request: APIRequestContext,
	title: string,
	overrides = {},
): Promise<Listing> {
	const response = await request.post("/api/listings", {
		data: {
			title,
			description: "Well maintained equipment with a loader included.",
			category: "tractor",
			startingPrice: 100,
			endsAt: new Date(Date.now() + 86400000).toISOString(),
			photos: [],
			...overrides,
		},
	});
	expect(response.status()).toBe(201);
	return response.json();
}
export async function fillListingForm(page: Page, title: string) {
	await page.getByLabel("Listing title").fill(title);
	await page.getByRole("combobox", { name: "Category", exact: true }).focus();
	await page.keyboard.press("Space");
	await page.getByRole("option", { name: "Tractor", exact: true }).click();
	await page
		.getByLabel("Description", { exact: true })
		.fill(
			"Well maintained. Loader included. Small scratch on the rear fender.",
		);
	await page.getByLabel("Starting bid (USD)").fill("2500.50");
}
export async function photoFile(page: Page, color: string) {
	const data = await page.evaluate((color) => {
		const canvas = document.createElement("canvas");
		canvas.width = 40;
		canvas.height = 30;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("Canvas unavailable");
		context.fillStyle = color;
		context.fillRect(0, 0, 40, 30);
		return canvas.toDataURL("image/png").split(",")[1];
	}, color);
	return {
		name: `${color}.png`,
		mimeType: "image/png",
		buffer: Buffer.from(data, "base64"),
	};
}
