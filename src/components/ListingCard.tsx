import { Link, useLocation } from "react-router-dom";
import type { Listing } from "../../shared/types";

interface Props {
	listing: Listing;
}

function timeRemaining(endsAt: string, status: string): string {
	if (status === "closed") return "Ended";
	const diff = new Date(endsAt).getTime() - Date.now();
	if (diff <= 0) return "Ended";
	const days = Math.floor(diff / 86_400_000);
	const hours = Math.floor((diff % 86_400_000) / 3_600_000);
	if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
	if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} left`;
	return "Less than an hour left";
}

export default function ListingCard({ listing }: Props) {
	const location = useLocation();
	const closed = listing.status === "closed";

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
					{timeRemaining(listing.endsAt, listing.status)}
				</div>
			</div>
		</Link>
	);
}
