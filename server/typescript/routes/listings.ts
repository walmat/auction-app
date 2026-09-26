import type { CreateListingRequest, Listing } from "../../../shared/types";
import { randomUUID } from "crypto";
import { Router, type Request, type Response } from "express";
import { appendListing, getListingById, getListings } from "../store";

export const listingsRouter = Router();

listingsRouter.get("/", (_req: Request, res: Response) => {
	res.json(getListings());
});

listingsRouter.post("/", (req: Request, res: Response) => {
	const { title } = req.body as CreateListingRequest;

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
