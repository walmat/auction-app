import { randomUUID } from "node:crypto";
import { type Request, type Response, Router } from "express";
import { NUMERICAL_REGEX } from "../../../shared/regex";
import type { BidHistoryResponse, BidRequest } from "../../../shared/types";
import { notifyListingsChanged } from "../events";
import { getBids, getListingById, recordBid } from "../storage/listings";

const MAX_LIMIT = 50;

export const bidsRouter = Router({ mergeParams: true });

bidsRouter.post("/", (req: Request, res: Response) => {
	const listing = getListingById(req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}

	if (listing.status !== "active") {
		return res
			.status(400)
			.json({ error: "This listing is not currently active" });
	}

	const bid: Partial<BidRequest> = req.body ?? {};

	if (
		!bid.bidder ||
		typeof bid.bidder !== "string" ||
		bid.bidder.trim() === ""
	) {
		return res.status(400).json({ error: "Bidder name is required" });
	}

	if (
		typeof bid.amount !== "number" ||
		!Number.isFinite(bid.amount) ||
		bid.amount <= 0
	) {
		return res
			.status(400)
			.json({ error: "Bid amount must be a positive number" });
	}

	if (bid.amount <= listing.currentBid) {
		return res.status(400).json({
			error: `Bid must be greater than the current bid of $${listing.currentBid.toLocaleString()}`,
		});
	}

	const updatedListing = recordBid(listing.id, {
		id: randomUUID(),
		bidderName: bid.bidder.trim(),
		amount: bid.amount,
		createdAt: new Date().toISOString(),
	});

	notifyListingsChanged();
	return res.status(201).json(updatedListing);
});

bidsRouter.get("/", (req: Request, res: Response) => {
	if (!getListingById(req.params.id)) {
		return res.status(404).json({ error: "Listing not found" });
	}

	const { before, limit: requestedLimit = "10" } = req.query;
	if (
		typeof requestedLimit !== "string" ||
		!NUMERICAL_REGEX.test(requestedLimit) ||
		Number(requestedLimit) < 1 ||
		Number(requestedLimit) > MAX_LIMIT ||
		(before !== undefined && (typeof before !== "string" || before === ""))
	) {
		return res.status(400).json({
			error: `Use a limit from 1 to ${MAX_LIMIT} and a valid bid cursor`,
		});
	}

	const bids = getBids(req.params.id);
	const end =
		before === undefined
			? bids.length
			: bids.findIndex((bid) => bid.id === before);
	if (end === -1) {
		return res
			.status(400)
			.json({ error: "Bid cursor not found for this listing" });
	}

	const start = Math.max(0, end - Number(requestedLimit));
	const page = bids.slice(start, end).reverse();
	const response: BidHistoryResponse = {
		bids: page,
		nextCursor: start > 0 ? page[page.length - 1].id : null,
	};
	return res.json(response);
});
