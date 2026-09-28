import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { subscribe } from "./helpers/events";
import { defaultListings, startTestServer } from "./helpers/server";

let api: Awaited<ReturnType<typeof startTestServer>>;
before(async () => {
	api = await startTestServer();
});
after(() => api.close());

test("two subscribers receive accepted bids and reconnect receives a fresh notification", async () => {
	const first = await subscribe(api.url);
	const second = await subscribe(api.url);
	try {
		await Promise.all([first.receive(), second.receive()]);
		assert.equal((await api.bid("open", 200, "Jane")).status, 201);
		await Promise.all([first.receive(), second.receive()]);
		const reconnect = await subscribe(api.url);
		try {
			await reconnect.receive();
		} finally {
			reconnect.close();
		}
	} finally {
		first.close();
		second.close();
	}
});

test("expiry notifies subscribers and the server rejects later bids", async () => {
	api.seed(
		defaultListings().map((item) =>
			item.id === "open"
				? { ...item, endsAt: new Date(Date.now() + 1200).toISOString() }
				: item,
		),
	);
	const stream = await subscribe(api.url);
	try {
		await stream.receive();
		await stream.receive();
		const result = await (await api.get("/listings/open")).json();
		assert.equal(result.status, "closed");
		assert.equal((await api.bid("open", 200)).status, 400);
	} finally {
		stream.close();
	}
});
