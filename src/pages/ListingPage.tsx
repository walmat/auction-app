import {
	Link,
	useLoaderData,
	useLocation,
	useRevalidator,
} from "react-router-dom";
import type { Listing } from "../../shared/types";
import ListingDetail from "../components/listings/ListingDetail";
import { returnToListings } from "../navigation";

export default function ListingPage() {
	const listing = useLoaderData<Listing>();
	const location = useLocation();
	const { revalidate } = useRevalidator();
	return (
		<div className="detail-page detail-page--listing">
			<title>{listing.title} · Interview Auctions</title>
			<Link className="back-link" to={returnToListings(location.state)}>
				← Back to lots
			</Link>
			<ListingDetail
				key={listing.id}
				listing={listing}
				onBidSuccess={revalidate}
			/>
		</div>
	);
}
