import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Listing } from "../../../../shared/types";

export function listing(id: string, overrides: Partial<Listing> = {}): Listing {
	return {
		id,
		title: `Tractor ${id}`,
		description: "Well maintained equipment.",
		category: "tractor",
		startingPrice: 100,
		currentBid: 100,
		currentBidder: null,
		status: "active",
		endsAt: new Date(Date.now() + 86400000).toISOString(),
		imageUrl: "",
		...overrides,
	};
}
export function defaultListings() {
	return [
		listing("open"),
		listing("expired", { endsAt: new Date(0).toISOString() }),
		listing("pending", { status: "pending" }),
		listing("closed", { status: "closed" }),
	];
}
export async function startTestServer(port = 0) {
	const directory = mkdtempSync(join(tmpdir(), "auction-test-"));
	process.env.AUCTION_DATA_DIR = directory;
	const seed = (listings = defaultListings()) => {
		rmSync(join(directory, "bids"), { recursive: true, force: true });
		rmSync(join(directory, "photos"), { recursive: true, force: true });
		writeFileSync(join(directory, "listings.json"), JSON.stringify(listings));
	};
	seed();
	const { app } = await import("../../app");
	const { watchExpirations } = await import("../../events");
	const timer = watchExpirations();
	const server = app.listen(port, "127.0.0.1");
	await new Promise<void>((resolve, reject) => {
		server.once("listening", resolve);
		server.once("error", reject);
	});
	const address = server.address();
	if (!address || typeof address === "string")
		throw new Error("No test server address");
	const url = `http://127.0.0.1:${address.port}`;
	const get = (path: string) => fetch(`${url}/api${path}`);
	const post = (path: string, data: unknown) =>
		fetch(`${url}/api${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
	return {
		url,
		seed,
		get,
		post,
		bid: (id: string, amount: number, bidder = "Jane") =>
			post(`/listings/${id}/bids`, { bidder, amount }),
		async close() {
			clearInterval(timer);
			server.closeAllConnections();
			await new Promise<void>((resolve, reject) =>
				server.close((error) => (error ? reject(error) : resolve())),
			);
			rmSync(directory, { recursive: true, force: true });
		},
	};
}
