import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { startTestServer } from "./helpers/server";

let api: Awaited<ReturnType<typeof startTestServer>>;
before(async () => {
	api = await startTestServer();
});
beforeEach(() => api.seed([]));
after(() => api.close());
const payload = () => ({
	title: "  2018 John Deere 6120M  ",
	description: " Good condition; loader included. ",
	category: "tractor",
	startingPrice: 1200.25,
	endsAt: new Date(Date.now() + 86400000).toISOString(),
	photos: [] as string[],
});

test("publishing persists the seller's details and immediately opens bidding", async () => {
	const data = payload();
	const response = await api.post("/listings", data);
	assert.equal(response.status, 201);
	const created = await response.json();
	assert.equal(created.title, data.title.trim());
	assert.equal(created.description, data.description.trim());
	assert.equal(created.category, data.category);
	assert.equal(created.startingPrice, data.startingPrice);
	assert.equal(created.currentBid, data.startingPrice);
	assert.equal(created.endsAt, data.endsAt);
	assert.equal(created.status, "active");
	assert.equal(created.imageUrl, "");
	assert.deepEqual(
		await (await api.get(`/listings/${created.id}`)).json(),
		created,
	);
	assert.equal((await api.bid(created.id, 1200)).status, 400);
	assert.equal((await api.bid(created.id, 1300)).status, 201);
});

test("creation validates required fields, price precision, closing time, and photo limits", async () => {
	const data = payload();
	for (const [field, value] of [
		["title", "abc"],
		["category", ""],
		["description", " "],
		["startingPrice", -1],
		["startingPrice", 1.001],
		["endsAt", new Date(0).toISOString()],
		["photos", Array(5).fill("data:image/jpeg;base64,/9j/2Q==")],
	] as const) {
		const response = await api.post("/listings", { ...data, [field]: value });
		assert.equal(response.status, 400, field);
		assert((await response.json()).errors[field], field);
	}
	assert.equal((await (await api.get("/listings")).json()).total, 0);
});

test("the first uploaded photo is the cover and uploaded bytes can be retrieved", async () => {
	const photo = "data:image/jpeg;base64,/9j/2Q==";
	const response = await api.post("/listings", {
		...payload(),
		photos: [photo],
	});
	assert.equal(response.status, 201);
	const created = await response.json();
	assert.equal(created.imageUrls[0], created.imageUrl);
	const image = await fetch(`${api.url}${created.imageUrl}`);
	assert.equal(image.status, 200);
	assert.equal(image.headers.get("content-type"), "image/jpeg");
	assert.deepEqual(
		Buffer.from(await image.arrayBuffer()),
		Buffer.from("/9j/2Q==", "base64"),
	);
});
