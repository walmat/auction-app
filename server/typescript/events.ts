import type { Request, Response } from "express";
import { getListingStatuses } from "./storage/listings";

const clients = new Set<Response>();

export function notifyListingsChanged() {
	for (const client of clients) {
		// Drop slow consumers; reconnecting clients fetch a fresh snapshot.
		if (!client.write("data: {}\n\n")) client.destroy();
	}
}

export function listingEvents(req: Request, res: Response) {
	res.set({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"X-Accel-Buffering": "no",
	});
	res.flushHeaders();
	clients.add(res);
	res.write("retry: 2000\ndata: {}\n\n");
	const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 15000);
	req.on("close", () => {
		clearInterval(heartbeat);
		clients.delete(res);
	});
}

export function watchExpirations() {
	let previous = JSON.stringify(getListingStatuses());
	const timer = setInterval(() => {
		try {
			const current = JSON.stringify(getListingStatuses());
			if (current !== previous) {
				previous = current;
				notifyListingsChanged();
			}
		} catch (error) {
			console.error("Unable to check auction expirations", error);
		}
	}, 1000);
	timer.unref();
	return timer;
}
