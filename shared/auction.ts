import type { Listing, Status } from "./types";

// Explicitly closed/pending lots must never become bid-able just because
// their deadline is in the future. Invalid deadlines fail closed.
export function auctionStatus(
	listing: Pick<Listing, "status" | "endsAt">,
	now = Date.now(),
): Status {
	if (!(Date.parse(listing.endsAt) > now)) return "closed";
	return listing.status;
}

export function formatTimeRemaining(endsAt: string, now = Date.now()): string {
	const remaining = Date.parse(endsAt) - now;
	if (!(remaining > 0)) return "Auction ended";
	const seconds = Math.ceil(remaining / 1000);
	const days = Math.floor(seconds / 86400);
	if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0) return `${hours}h ${minutes}m left`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s left`;
	return `${seconds}s left`;
}
