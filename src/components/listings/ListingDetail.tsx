import type { Listing } from "../../../shared/types";
import { useAuctionStatus } from "../../hooks/useAuctionStatus";
import BidForm from "../bids/BidForm";
import BidHistory from "../bids/BidHistory";
import AuctionCountdown from "./AuctionCountdown";

interface Props {
	listing: Listing;
	onBidSuccess: (updated: Listing) => void;
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function ListingDetail({ listing, onBidSuccess }: Props) {
	const status = useAuctionStatus(listing);
	return (
		<div className="listing-detail">
			{listing.imageUrl && (
				<img
					src={listing.imageUrl}
					alt={listing.title}
					className="listing-detail__image"
				/>
			)}
			<div className="listing-detail__header">
				<span className={`badge badge--${listing.category}`}>
					{listing.category}
				</span>
				<span className={`status-badge status-badge--${status}`}>{status}</span>
			</div>
			<h1 className="listing-detail__title">{listing.title}</h1>
			<p className="listing-detail__description">{listing.description}</p>

			<div className="listing-detail__meta">
				<div className="meta-row">
					<span className="meta-label">Starting Price</span>
					<span className="meta-value">
						${listing.startingPrice.toLocaleString()}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Current Bid</span>
					<span className="meta-value meta-value--highlight">
						${listing.currentBid.toLocaleString()}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Current Bidder</span>
					<span className="meta-value">
						{listing.currentBidder ?? "No bids yet"}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Auction Ends</span>
					<span className="meta-value">{formatDate(listing.endsAt)}</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Time remaining</span>
					<span className="meta-value">
						{status === "closed" ? (
							"Auction ended"
						) : status === "pending" ? (
							"Auction pending"
						) : (
							<AuctionCountdown endsAt={listing.endsAt} />
						)}
					</span>
				</div>
			</div>

			{status === "active" && (
				<BidForm listing={listing} onBidSuccess={onBidSuccess} />
			)}
			<BidHistory
				key={`${listing.id}:${listing.currentBid}`}
				listingId={listing.id}
				closed={status === "closed"}
			/>
		</div>
	);
}
