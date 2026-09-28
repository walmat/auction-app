import { randomUUID } from "crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { dataDirectory } from "./paths";
import type { ListingsQuery } from "../../../shared/listings";
import type { Bid, Listing, ListingsResponse } from "../../../shared/types";

const listingsPath = join(dataDirectory, "listings.json");
const bidsDir = join(dataDirectory, "bids");

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

export const getListings = (query: ListingsQuery): ListingsResponse => {
	const search = query.q.toLowerCase();
	let listings = readListings().filter(
		(listing) =>
			(!search || listing.title.toLowerCase().includes(search)) &&
			(query.category.length === 0 ||
				query.category.includes(listing.category)) &&
			(query.status.length === 0 || query.status.includes(listing.status)),
	);
	const sortByBid = query.sort !== "ending-soonest";
	if (sortByBid) listings = listings.map(withCurrentBid);
	listings.sort((a, b) => {
		const difference =
			query.sort === "bid-lowest"
				? a.currentBid - b.currentBid
				: query.sort === "bid-highest"
					? b.currentBid - a.currentBid
					: Date.parse(a.endsAt) - Date.parse(b.endsAt);
		return difference || a.id.localeCompare(b.id);
	});
	const total = listings.length;
	const totalPages = Math.ceil(total / query.pageSize);
	const start = (query.page - 1) * query.pageSize;
	const page = listings.slice(start, start + query.pageSize);
	return {
		listings: sortByBid ? page : page.map(withCurrentBid),
		page: query.page,
		pageSize: query.pageSize,
		total,
		totalPages,
		hasNextPage: query.page < totalPages,
	};
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
