import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Listing } from "../../../shared/types";
import { useAuctionStatus } from "../../hooks/useAuctionStatus";
import AuctionCountdown from "./AuctionCountdown";

interface Props {
	listing: Listing;
}

export default function ListingCard({ listing }: Props) {
	const location = useLocation();
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const status = useAuctionStatus(listing);
	const closed = status === "closed";
	const hasBids = listing.currentBidder !== null;
	const priceLabel = hasBids
		? closed
			? "Final bid"
			: "Current bid"
		: "Starting bid";
	const price = hasBids ? listing.currentBid : listing.startingPrice;

	return (
		<Link
			to={`/listings/${listing.id}`}
			state={{ from: location.pathname + location.search }}
			className={`listing-card ${closed ? "listing-card--closed" : ""}`}
		>
			<div className="listing-card__media">
				<span className={`listing-card__category badge--${listing.category}`}>
					{listing.category}
				</span>
				{listing.imageUrl && failedImage !== listing.imageUrl ? (
					<img
						src={listing.imageUrl}
						onError={() => setFailedImage(listing.imageUrl)}
						loading="lazy"
						alt={listing.title}
						className="listing-card__image"
					/>
				) : (
					<div className="listing-card__placeholder">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.2"
							aria-hidden="true"
						>
							<rect x="3" y="4" width="18" height="16" rx="3" />
							<circle cx="8.5" cy="9" r="1.5" />
							<path d="m3 17 5-5 4 4 4-6 5 7" />
						</svg>
						<span>Photo unavailable</span>
					</div>
				)}
			</div>
			<div className="listing-card__body">
				<h3 className="listing-card__title">{listing.title}</h3>
				<div className="listing-card__footer">
					<div className="listing-card__bid">
						<span className="listing-card__bid-label">{priceLabel}</span>
						<strong>${price.toLocaleString()}</strong>
					</div>
					<span
						className={`listing-card__time ${closed ? "listing-card__time--ended" : ""}`}
					>
						{closed ? (
							"Ended"
						) : status === "pending" ? (
							"Pending"
						) : (
							<AuctionCountdown endsAt={listing.endsAt} />
						)}
					</span>
				</div>
			</div>
		</Link>
	);
}
