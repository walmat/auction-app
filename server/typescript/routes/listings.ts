import { randomUUID } from "node:crypto";
import { type Request, type Response, Router } from "express";
import { validateCreateListing } from "../../../shared/createListing";
import { parseListingsQuery } from "../../../shared/listings";
import type { CreateListingRequest, Listing } from "../../../shared/types";
import { notifyListingsChanged } from "../events";
import {
	appendListing,
	getListingById,
	getListings,
} from "../storage/listings";
import { removePhotos, savePhotos } from "../storage/photos";

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
	const errors = validateCreateListing(req.body);
	if (Object.keys(errors).length) {
		return res.status(400).json({ error: Object.values(errors)[0], errors });
	}
	const data = req.body as CreateListingRequest;
	const id = randomUUID();
	let listing: Listing;
	try {
		const imageUrls = savePhotos(id, data.photos);
		listing = {
			id,
			title: data.title.trim(),
			description: data.description.trim(),
			category: data.category,
			startingPrice: data.startingPrice,
			currentBid: data.startingPrice,
			currentBidder: null,
			status: "active",
			endsAt: new Date(data.endsAt).toISOString(),
			imageUrl: imageUrls[0] ?? "",
			imageUrls,
		};
		appendListing(listing);
	} catch {
		removePhotos(id);
		return res.status(500).json({
			error:
				"We couldn't publish your listing. Your draft is still available; please try again.",
		});
	}
	notifyListingsChanged();

	return res.status(201).json(listing);
});

listingsRouter.get("/:id", (req: Request, res: Response) => {
	const listing = getListingById(req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}
	return res.json(listing);
});
