import { useBidHistory } from "../../hooks/useBidHistory";

interface Props {
	listingId: string;
	closed?: boolean;
}

const currency = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "USD",
});
const dateTime = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "medium",
});

export default function BidHistory({ listingId, closed = false }: Props) {
	const { cursors, page, error, loading, navigate, retry } =
		useBidHistory(listingId);
	return (
		<section className="bid-history" aria-labelledby="bid-history-title">
			<h2 id="bid-history-title">Bid history</h2>
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
						<button type="button" onClick={retry}>
							Try again
						</button>
					</div>
				)}
				{page && page.bids.length === 0 && (
					<div className="bid-history__empty">
						<strong>{closed ? "No bids were placed" : "No bids yet"}</strong>
						<p>
							{closed
								? "This auction closed without any bidding activity."
								: "Accepted bids will appear here, newest first."}
						</p>
					</div>
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
			{(cursors.length > 1 || page?.nextCursor) && (
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
			)}
		</section>
	);
}
