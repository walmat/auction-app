import type { Bid, Listing } from "../../shared/types";
import { randomUUID } from "crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "data");
const listingsPath = join(dataDir, "listings.json");
const bidsDir = join(dataDir, "bids");

const writeJson = (path: string, value: unknown): void => {
	mkdirSync(dirname(path), { recursive: true });
	const temporaryPath = `${path}.${randomUUID()}.tmp`;
	try {
		writeFileSync(temporaryPath, JSON.stringify(value, null, 2));
		renameSync(temporaryPath, path);
	} finally {
		rmSync(temporaryPath, { force: true });
	}
};

const readListings = (): Listing[] => {
	return JSON.parse(readFileSync(listingsPath, "utf-8"));
};

const readBids = (listingId: string): Bid[] => {
	let contents: string;
	try {
		contents = readFileSync(join(bidsDir, `${listingId}.json`), "utf-8");
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}
		throw err;
	}

	return JSON.parse(contents);
};

const withCurrentBid = (listing: Listing): Listing => {
	const bids = readBids(listing.id);
	const latest = bids[bids.length - 1];
	return latest
		? {
				...listing,
				currentBid: latest.amount,
				currentBidder: latest.bidderName,
			}
		: listing;
};

export const getListings = (): Listing[] => {
	return readListings().map(withCurrentBid);
};

export const appendListing = (listing: Listing): void => {
	writeJson(listingsPath, [...readListings(), listing]);
};

export const getListingById = (id: string): Listing | undefined => {
	const listing = readListings().find((listing) => listing.id === id);
	return listing ? withCurrentBid(listing) : undefined;
};

export const getBids = (listingId: string): Bid[] => {
	if (!readListings().some((listing) => listing.id === listingId)) {
		throw new Error("Listing not found");
	}
	return readBids(listingId);
};

export const recordBid = (listingId: string, bid: Bid): Listing => {
	const listing = getListingById(listingId);
	if (!listing) throw new Error("Listing not found");

	writeJson(join(bidsDir, `${listingId}.json`), [...readBids(listingId), bid]);
	return { ...listing, currentBid: bid.amount, currentBidder: bid.bidderName };
};
