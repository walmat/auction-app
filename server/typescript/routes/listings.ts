import { randomUUID } from "crypto";
import { type Request, type Response, Router } from "express";
import { parseListingsQuery } from "../../../shared/listings";
import type { CreateListingRequest, Listing } from "../../../shared/types";
import { appendListing, getListingById, getListings } from "../store";

export const listingsRouter = Router();

listingsRouter.get("/", (req: Request, res: Response) => {
	let query: ReturnType<typeof parseListingsQuery>;
	try {
		query = parseListingsQuery(
			new URL(req.originalUrl, "http://localhost").searchParams,
		);
	} catch (error) {
		return res.status(400).json({
			error: error instanceof Error ? error.message : "Invalid query",
		});
	}
	return res.json(getListings(query));
});

listingsRouter.post("/", (req: Request, res: Response) => {
	const { title }: CreateListingRequest = req.body;

	if (!title || typeof title !== "string" || title.trim() === "") {
		return res.status(400).json({ error: "Title is required" });
	}

	const listing: Listing = {
		id: randomUUID(),
		title: title.trim(),
		description: "",
		category: "implement",
		startingPrice: 0,
		currentBid: 0,
		currentBidder: null,
		status: "active",
		endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		imageUrl: "",
	};

	appendListing(listing);

	return res.status(201).json(listing);
});

listingsRouter.get("/:id", (req: Request, res: Response) => {
	const listing = getListingById(req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}
	return res.json(listing);
});
