import { IS_LISTING_ROUTE } from "../shared/regex";

export function returnToListings(state: unknown): string {
	const from = (state as { from?: unknown } | null)?.from;
	return typeof from === "string" && IS_LISTING_ROUTE.test(from)
		? from
		: "/listings";
}
