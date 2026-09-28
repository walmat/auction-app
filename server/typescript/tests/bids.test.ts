import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { startTestServer } from "./helpers/server";

let api: Awaited<ReturnType<typeof startTestServer>>;
before(async () => {
	api = await startTestServer();
});
beforeEach(() => api.seed());
after(() => api.close());

test("accepted bids update the listing and appear newest first in paginated history", async () => {
	assert.equal((await api.bid("open", 200, "Jane")).status, 201);
	assert.equal((await api.bid("open", 300, "Alex")).status, 201);
	const first = await (await api.get("/listings/open/bids?limit=1")).json();
	assert.equal(first.bids.length, 1);
	assert.equal(first.bids[0].bidderName, "Alex");
	assert.equal(first.bids[0].amount, 300);
	assert(Number.isFinite(Date.parse(first.bids[0].createdAt)));
	assert(first.nextCursor);
	const older = await (
		await api.get(`/listings/open/bids?limit=1&before=${first.nextCursor}`)
	).json();
	assert.equal(older.bids[0].bidderName, "Jane");
	assert.equal(older.bids[0].amount, 200);
	assert.equal(older.nextCursor, null);
	const listing = await (await api.get("/listings/open")).json();
	assert.equal(listing.currentBid, 300);
	assert.equal(listing.currentBidder, "Alex");
});

test("rejected bids do not change the current bid or history", async () => {
	for (const [amount, bidder] of [
		[100, "Jane"],
		[50, "Jane"],
		[200, " "],
	] as const) {
		assert.equal((await api.bid("open", amount, bidder)).status, 400);
	}
	const listing = await (await api.get("/listings/open")).json();
	assert.equal(listing.currentBid, 100);
	assert.equal(listing.currentBidder, null);
	assert.deepEqual(await (await api.get("/listings/open/bids")).json(), {
		bids: [],
		nextCursor: null,
	});
});

test("expired, pending, and closed auctions reject bids", async () => {
	for (const id of ["expired", "pending", "closed"])
		assert.equal((await api.bid(id, 200)).status, 400);
});

test("empty bid history returns an empty page; a missing listing returns 404", async () => {
	assert.deepEqual(await (await api.get("/listings/open/bids")).json(), {
		bids: [],
		nextCursor: null,
	});
	assert.equal((await api.get("/listings/missing/bids")).status, 404);
});

test("only one simultaneous bid at the same amount is accepted", async () => {
	const responses = await Promise.all([
		api.bid("open", 200, "Jane"),
		api.bid("open", 200, "John"),
	]);
	assert.deepEqual(
		responses.map((response) => response.status).sort(),
		[201, 400],
	);
	const history = await (await api.get("/listings/open/bids")).json();
	assert.equal(history.bids.length, 1);
});
