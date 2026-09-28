import { useEffect, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router-dom";
import type { Listing } from "../../shared/types";
import ListingDetail from "../components/listings/ListingDetail";
import { IS_LISTING_ROUTE } from "../../shared/regex";

export function returnToListings(state: unknown): string {
	const from = (state as { from?: unknown } | null)?.from;
	return typeof from === "string" && IS_LISTING_ROUTE.test(from)
		? from
		: "/listings";
}

function Detail({ initialListing }: { initialListing: Listing }) {
	const [listing, setListing] = useState(initialListing);
	useEffect(() => {
		document.title = `${listing.title} · Interview Auctions`;
	}, [listing.title]);
	return <ListingDetail listing={listing} onBidSuccess={setListing} />;
}

export default function ListingPage() {
	const listing = useLoaderData<Listing>();
	const location = useLocation();
	return (
		<div className="detail-page">
			<Link className="back-link" to={returnToListings(location.state)}>
				← Back to lots
			</Link>
			<Detail key={listing.id} initialListing={listing} />
		</div>
	);
}
