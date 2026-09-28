import { Link, useLocation } from "react-router-dom";
import type { Listing } from "../../../shared/types";
import { useAuctionStatus } from "../../hooks/useAuctionStatus";
import AuctionCountdown from "./AuctionCountdown";

interface Props {
	listing: Listing;
}

export default function ListingCard({ listing }: Props) {
	const location = useLocation();
	const status = useAuctionStatus(listing);
	const closed = status === "closed";

	return (
		<Link
			to={`/listings/${listing.id}`}
			state={{ from: location.pathname + location.search }}
			className={`listing-card ${closed ? "listing-card--closed" : ""}`}
		>
			{listing.imageUrl ? (
				<img
					src={listing.imageUrl || undefined}
					loading="lazy"
					alt={listing.title}
					className="listing-card__image"
				/>
			) : (
				<div className="listing-card__placeholder">No photo</div>
			)}
			<div className="listing-card__body">
				<span className={`badge badge--${listing.category}`}>
					{listing.category}
				</span>
				<h3 className="listing-card__title">{listing.title}</h3>
				<div className="listing-card__bid">
					Current bid: <strong>${listing.currentBid.toLocaleString()}</strong>
				</div>
				<div
					className={`listing-card__time ${closed ? "listing-card__time--ended" : ""}`}
				>
					{closed ? (
						"Ended"
					) : status === "pending" ? (
						"Pending"
					) : (
						<AuctionCountdown endsAt={listing.endsAt} />
					)}
				</div>
			</div>
		</Link>
	);
}
