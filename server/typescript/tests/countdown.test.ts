import assert from "node:assert/strict";
import { test } from "node:test";
import { auctionStatus, formatTimeRemaining } from "../../../shared/auction";

test("countdown formats and exact deadline; pending and closed stay unavailable", () => {
	const now = Date.now();
	assert.equal(
		formatTimeRemaining(new Date(now + 3_660_000).toISOString(), now),
		"1h 1m left",
	);
	assert.equal(
		formatTimeRemaining(new Date(now + 90_000).toISOString(), now),
		"1m 30s left",
	);
	assert.equal(
		formatTimeRemaining(new Date(now + 3 * 86400000).toISOString(), now),
		"3 days left",
	);
	assert.equal(
		formatTimeRemaining(new Date(now + 45000).toISOString(), now),
		"45s left",
	);
	assert.equal(
		formatTimeRemaining(new Date(now).toISOString(), now),
		"Auction ended",
	);
	assert.equal(
		auctionStatus(
			{ status: "active", endsAt: new Date(now).toISOString() },
			now,
		),
		"closed",
	);
	assert.equal(
		auctionStatus(
			{ status: "pending", endsAt: new Date(now + 1000).toISOString() },
			now,
		),
		"pending",
	);
	assert.equal(
		auctionStatus(
			{ status: "closed", endsAt: new Date(now + 1000).toISOString() },
			now,
		),
		"closed",
	);
});
