import { useEffect, useState } from "react";
import type { BidHistoryResponse } from "../../shared/types";
import { getBidHistory } from "../api/listings";

interface Props {
	listingId: string;
}

const currency = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "USD",
});
const dateTime = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "medium",
});

export default function BidHistory({ listingId }: Props) {
	const [cursors, setCursors] = useState<(string | null)[]>([null]);
	const [page, setPage] = useState<BidHistoryResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [attempt, setAttempt] = useState(0);
	const before = cursors[cursors.length - 1];
	const loading = page === null && error === null;

	useEffect(() => {
		const controller = new AbortController();
		getBidHistory(listingId, before, controller.signal)
			.then((data) => {
				if (!controller.signal.aborted) setPage(data);
			})
			.catch((err: unknown) => {
				if (!controller.signal.aborted) {
					setError(
						err instanceof Error ? err.message : "Failed to load bid history",
					);
				}
			});
		return () => controller.abort();
	}, [listingId, before, attempt]);

	const navigate = (next: (string | null)[]) => {
		setPage(null);
		setError(null);
		setCursors(next);
	};

	return (
		<section className="bid-history" aria-labelledby="bid-history-title">
			<h3 id="bid-history-title">Bid history</h3>
			<p className="bid-history__subtitle">Newest bids first</p>
			<div aria-busy={loading}>
				{loading && (
					<p role="status" className="bid-history__message">
						Loading bids…
					</p>
				)}
				{error && (
					<div className="bid-history__message">
						<p role="alert">{error}</p>
						<button
							type="button"
							onClick={() => {
								setError(null);
								setAttempt((value) => value + 1);
							}}
						>
							Try again
						</button>
					</div>
				)}
				{page && page.bids.length === 0 && (
					<p className="bid-history__message">No bids yet.</p>
				)}
				{page && page.bids.length > 0 && (
					<ol className="bid-history__list" aria-label="Bids, newest first">
						{page.bids.map((bid) => (
							<li key={bid.id} className="bid-history__row">
								<div className="bid-history__bidder">
									<span>{bid.bidderName}</span>
									<time dateTime={bid.createdAt}>
										{dateTime.format(new Date(bid.createdAt))}
									</time>
								</div>
								<strong>{currency.format(bid.amount)}</strong>
							</li>
						))}
					</ol>
				)}
			</div>
			<nav className="bid-history__pagination" aria-label="Bid history pages">
				<button
					type="button"
					disabled={loading || cursors.length === 1}
					onClick={() => navigate(cursors.slice(0, -1))}
				>
					Newer
				</button>
				<span role="status">Page {cursors.length}</span>
				<button
					type="button"
					disabled={loading || !page?.nextCursor}
					onClick={() => {
						if (page?.nextCursor) navigate([...cursors, page.nextCursor]);
					}}
				>
					Older
				</button>
			</nav>
		</section>
	);
}
