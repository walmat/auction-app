export type Category = "tractor" | "combine" | "implement" | "attachment";
export type Status = "active" | "closed" | "pending";

export interface Listing {
	id: string;
	title: string;
	description: string;
	category: Category;
	startingPrice: number;
	currentBid: number;
	currentBidder: string | null;
	status: Status;
	endsAt: string;
	imageUrl: string;
}

export interface BidRequest {
	bidder: string;
	amount: number;
}

export interface CreateListingRequest {
	title: string;
}

export interface Bid {
	id: string;
	bidderName: string;
	amount: number;
	createdAt: string;
}

export interface BidHistoryResponse {
	bids: Bid[];
	nextCursor: string | null;
}

export interface ListingsResponse {
	listings: Listing[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
}
