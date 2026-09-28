import { Link } from "react-router-dom";
import type { Listing, Status } from "../../../shared/types";
import BidForm from "../bids/BidForm";
import AuctionCountdown from "./AuctionCountdown";

interface Props {
	listing: Listing;
	status: Status;
	onBidSuccess: (updated: Listing) => void;
}
function formatDate(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		dateStyle: "long",
		timeStyle: "short",
	});
}

export default function AuctionPanel({ listing, status, onBidSuccess }: Props) {
	const closed = status === "closed";
	const hasBids = listing.currentBidder !== null;
	const priceLabel = hasBids
		? closed
			? "Final bid"
			: "Current bid"
		: "Starting bid";
	const price = hasBids ? listing.currentBid : listing.startingPrice;

	return (
		<aside className="auction-panel" aria-labelledby="auction-panel-title">
			<div className="auction-panel__heading">
				<h2 id="auction-panel-title">Auction details</h2>
				<span className={`status-badge status-badge--${status}`}>
					{closed ? "Ended" : status === "active" ? "Active" : "Pending"}
				</span>
			</div>
			<div className="auction-panel__price">
				<span>{priceLabel}</span>
				<strong>${price.toLocaleString()}</strong>
			</div>
			<div
				className={`auction-panel__countdown ${closed ? "auction-panel__countdown--closed" : ""}`}
			>
				<span>
					{closed
						? "Bidding closed"
						: status === "pending"
							? "Bidding not yet open"
							: "Time remaining"}
				</span>
				<strong>
					{closed ? (
						"Auction ended"
					) : status === "pending" ? (
						"Auction pending"
					) : (
						<AuctionCountdown endsAt={listing.endsAt} />
					)}
				</strong>
			</div>
			<dl className="auction-panel__facts">
				<div>
					<dt>{closed ? "Ended" : "Closes"}</dt>
					<dd>
						<time dateTime={listing.endsAt}>{formatDate(listing.endsAt)}</time>
					</dd>
				</div>
				{hasBids && (
					<div>
						<dt>Starting bid</dt>
						<dd>${listing.startingPrice.toLocaleString()}</dd>
					</div>
				)}
				<div>
					<dt>{closed ? "Highest bidder" : "Leading bidder"}</dt>
					<dd>{listing.currentBidder ?? "No bids"}</dd>
				</div>
			</dl>
			{status === "active" ? (
				<BidForm listing={listing} onBidSuccess={onBidSuccess} />
			) : (
				<div className="auction-panel__notice">
					<p>
						{closed
							? hasBids
								? "This auction has ended. Bidding is closed."
								: "This auction ended without any bids."
							: "This lot is not accepting bids yet."}
					</p>
					{closed && (
						<Link
							to="/listings?status=active"
							className="button button--primary"
						>
							Browse active auctions <span aria-hidden="true">↗</span>
						</Link>
					)}
				</div>
			)}
		</aside>
	);
}
