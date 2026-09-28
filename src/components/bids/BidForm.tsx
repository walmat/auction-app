import { useState } from "react";
import { auctionStatus } from "../../../shared/auction";
import type { Listing } from "../../../shared/types";
import { placeBid } from "../../api/listings";

interface Props {
	listing: Listing;
	onBidSuccess: (updated: Listing) => void;
}

export default function BidForm({ listing, onBidSuccess }: Props) {
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		// currentTarget is only available during the synchronous event handler.
		const target = e.currentTarget;
		e.preventDefault();
		setError(null);
		if (submitting) return;
		if (auctionStatus(listing) !== "active") {
			setError("This auction is not open for bidding.");
			return;
		}

		const data = new FormData(target);
		const bidder = (data.get("bidder") as string).trim();
		const numAmount = parseFloat(data.get("amount") as string);

		if (!bidder) {
			setError("Bidder name is required.");
			return;
		}
		if (!Number.isFinite(numAmount) || numAmount <= 0) {
			setError("Please enter a valid bid amount.");
			return;
		}

		if (numAmount <= listing.currentBid) {
			setError("Your bid must exceed the current bid.");
			return;
		}
		setSubmitting(true);
		try {
			const updated = await placeBid(listing.id, bidder, numAmount);
			onBidSuccess(updated);
			target.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to place bid");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form className="bid-form" onSubmit={handleSubmit}>
			<h3 className="bid-form__title">Place your bid</h3>
			{error && (
				<div role="alert" className="bid-form__error">
					{error}
				</div>
			)}
			<div className="bid-form__field">
				<label htmlFor="bidder">Your Name</label>
				<input
					id="bidder"
					name="bidder"
					type="text"
					placeholder="e.g. Jane Smith"
					disabled={submitting}
				/>
			</div>
			<div className="bid-form__field">
				<label htmlFor="amount">Bid Amount ($)</label>
				<input
					id="amount"
					name="amount"
					type="number"
					placeholder={`e.g. ${(listing.currentBid + 1_000).toLocaleString()}`}
					min={listing.currentBid + 0.01}
					step="0.01"
					disabled={submitting}
				/>
			</div>
			<button type="submit" className="bid-form__submit" disabled={submitting}>
				{submitting ? "Submitting…" : "Submit Bid"}
			</button>
		</form>
	);
}
