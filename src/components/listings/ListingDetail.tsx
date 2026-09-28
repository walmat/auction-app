import { useState } from "react";
import type { Listing } from "../../../shared/types";
import { useAuctionStatus } from "../../hooks/useAuctionStatus";
import BidHistory from "../bids/BidHistory";
import AuctionPanel from "./AuctionPanel";

interface Props {
	listing: Listing;
	onBidSuccess: (updated: Listing) => void;
}

export default function ListingDetail({ listing, onBidSuccess }: Props) {
	const status = useAuctionStatus(listing);
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const imageUrl = listing.imageUrl;

	return (
		<article className="listing-detail">
			<header className="listing-detail__heading">
				<h1 className="listing-detail__title">{listing.title}</h1>
			</header>
			<div className="listing-detail__layout">
				<div className="listing-detail__media">
					<span className={`listing-card__category badge--${listing.category}`}>
						{listing.category}
					</span>
					{imageUrl && failedImage !== imageUrl ? (
						<img
							src={imageUrl}
							alt={listing.title}
							className="listing-detail__image"
							onError={() => setFailedImage(imageUrl)}
						/>
					) : (
						<div className="listing-detail__placeholder">
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

				<AuctionPanel
					listing={listing}
					status={status}
					onBidSuccess={onBidSuccess}
				/>

				<section
					className="listing-detail__about"
					aria-labelledby="about-lot-title"
				>
					<h2 id="about-lot-title">About this equipment</h2>
					<p>
						{listing.description ||
							"No description has been provided for this lot."}
					</p>
				</section>
				<BidHistory
					key={`${listing.id}:${listing.currentBid}`}
					listingId={listing.id}
					closed={status === "closed"}
				/>
			</div>
		</article>
	);
}
