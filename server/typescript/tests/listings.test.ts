import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { listing, startTestServer } from "./helpers/server";

let api: Awaited<ReturnType<typeof startTestServer>>;
before(async () => {
	api = await startTestServer();
});
beforeEach(() =>
	api.seed([
		listing("deere", {
			title: "John Deere Tractor",
			startingPrice: 200,
			currentBid: 200,
			endsAt: new Date(Date.now() + 86400000).toISOString(),
		}),
		listing("case", {
			title: "Case Tractor",
			startingPrice: 100,
			currentBid: 100,
			endsAt: new Date(Date.now() + 172800000).toISOString(),
		}),
		listing("combine", { title: "John Deere Combine", category: "combine" }),
		listing("expired", {
			title: "John Deere Old Tractor",
			endsAt: new Date(0).toISOString(),
		}),
	]),
);
after(() => api.close());

test("title search combines with category and status filters", async () => {
	const result = await (
		await api.get("/listings?q=DEERE&category=tractor&status=active")
	).json();
	assert.deepEqual(
		result.listings.map((item: { id: string }) => item.id),
		["deere"],
	);
	assert.equal(result.total, 1);
	const closed = await (await api.get("/listings?status=closed")).json();
	assert.deepEqual(
		closed.listings.map((item: { id: string }) => item.id),
		["expired"],
	);
});

test("pagination reports totals and ends on the last page", async () => {
	const first = await (
		await api.get("/listings?category=tractor&status=active&pageSize=1")
	).json();
	assert.equal(first.page, 1);
	assert.equal(first.total, 2);
	assert.equal(first.totalPages, 2);
	assert.equal(first.hasNextPage, true);
	assert.equal(first.listings[0].id, "deere");
	const last = await (
		await api.get("/listings?category=tractor&status=active&pageSize=1&page=2")
	).json();
	assert.equal(last.page, 2);
	assert.equal(last.hasNextPage, false);
	assert.equal(last.listings[0].id, "case");
});

test("sorting uses the current bid, including newly accepted bids", async () => {
	assert.equal((await api.bid("case", 300)).status, 201);
	const low = await (
		await api.get("/listings?category=tractor&status=active&sort=bid-lowest")
	).json();
	assert.deepEqual(
		low.listings.map((item: { id: string }) => item.id),
		["deere", "case"],
	);
	const high = await (
		await api.get("/listings?category=tractor&status=active&sort=bid-highest")
	).json();
	assert.deepEqual(
		high.listings.map((item: { id: string }) => item.id),
		["case", "deere"],
	);
});
