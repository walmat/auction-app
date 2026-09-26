import type {
	BidHistoryResponse,
	BidRequest,
	CreateListingRequest,
	Listing,
	ListingsResponse,
} from "../../shared/types";

export async function getListings(
	params: URLSearchParams,
	signal?: AbortSignal,
): Promise<ListingsResponse> {
	const res = await fetch(`/api/listings?${params}`, { signal });
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || "Failed to fetch listings");
	}
	return res.json();
}

export async function getListing(
	id: string,
	signal?: AbortSignal,
): Promise<Listing> {
	const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
		signal,
	});
	if (!res.ok)
		throw new Error(
			res.status === 404 ? "Listing not found" : "Failed to fetch listing",
		);
	return res.json();
}

export async function createListing(
	data: CreateListingRequest,
): Promise<Listing> {
	const res = await fetch("/api/listings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || body.detail || "Failed to create listing");
	}
	return res.json();
}

export async function placeBid(
	listingId: string,
	bidder: string,
	amount: number,
): Promise<Listing> {
	const bid: BidRequest = { bidder, amount };
	const res = await fetch(`/api/listings/${listingId}/bids`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(bid),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || data.detail || "Failed to place bid");
	}
	return res.json();
}

export async function getBidHistory(
	listingId: string,
	before: string | null,
	signal: AbortSignal,
): Promise<BidHistoryResponse> {
	const query = new URLSearchParams({ limit: "10" });
	if (before !== null) query.set("before", before);
	const res = await fetch(
		`/api/listings/${encodeURIComponent(listingId)}/bids?${query}`,
		{ signal },
	);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || "Failed to load bid history");
	}
	return res.json();
}
