import { useEffect } from "react";
import {
	Link,
	useLoaderData,
	useLocation,
	useNavigate,
	useNavigation,
} from "react-router-dom";
import { type ListingsQuery, parseListingsQuery } from "../../shared/listings";
import type { ListingsResponse } from "../../shared/types";
import ListingCard from "../components/listings/ListingCard";
import ListingFilters from "../components/listings/ListingFilters";
import ListingSearch from "../components/listings/ListingSearch";

export default function ListingsPage() {
	const { query: loadedQuery, results } = useLoaderData<{ query: ListingsQuery; results: ListingsResponse }>();
	const location = useLocation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const pendingSearch =
		navigation.location?.pathname === "/listings"
			? navigation.location.search
			: location.search;
	const query = parseListingsQuery(new URLSearchParams(pendingSearch));
	const loading = navigation.state !== "idle";
	useEffect(() => {
		document.title = "Auction lots · Interview Auctions";
	}, []);

	const update = (
		changes: Record<string, string | string[] | null>,
		replace = false,
	) => {
		const params = new URLSearchParams(pendingSearch);
		for (const [key, value] of Object.entries(changes)) {
			params.delete(key);
			if (Array.isArray(value))
				value.forEach((item) => {
					params.append(key, item);
				});
			else if (value) params.set(key, value);
		}
		const search = params.toString();
		if (search !== new URLSearchParams(pendingSearch).toString()) {
			void navigate(
				{ pathname: "/listings", search },
				{ replace, preventScrollReset: true, flushSync: true },
			);
		}
	};
	const start = results.listings.length
		? (results.page - 1) * results.pageSize + 1
		: 0;
	const end = results.listings.length ? start + results.listings.length - 1 : 0;

	return (
		<>
			<div className="page-heading">
				<div>
					<h1>Auction lots</h1>
					<p>Find your next piece of equipment.</p>
				</div>
				<Link
					className="button button--primary"
					to="/listings/new"
					state={{ from: location.pathname + location.search }}
				>
					+ New lot
				</Link>
			</div>
			<div className="listing-toolbar">
				<ListingSearch
					value={loadedQuery.q}
					onSearch={(q) => update({ q: q.trim(), page: null }, true)}
				/>
				<ListingFilters
					filters={query}
					onChange={(field, values) => update({ [field]: values, page: null })}
					onClear={() =>
						update({ q: null, category: null, status: null, page: null })
					}
				/>
				<label className="select-control listing-sort">
					Sort by
					<select
						value={query.sort}
						onChange={(event) =>
							update({ sort: event.target.value, page: null })
						}
					>
						<option value="ending-soonest">Ending soonest</option>
						<option value="bid-lowest">Current bid: low to high</option>
						<option value="bid-highest">Current bid: high to low</option>
					</select>
				</label>
			</div>

			<div className="results-heading" role="status">
				{results.total} matching {results.total === 1 ? "lot" : "lots"}
			</div>
			<div aria-busy={loading} inert={loading} className="results">
				{results.listings.length > 0 ? (
					<div className="listing-grid">
						{results.listings.map((listing) => (
							<ListingCard key={listing.id} listing={listing} />
						))}
					</div>
				) : (
					<div className="results-empty">
						<h2>
							{results.total > 0 ? "No lots on this page" : "No matching lots"}
						</h2>
						<p>
							{results.total > 0
								? "Return to the first page to browse these results."
								: "Try another search or remove a filter."}
						</p>
						<button
							type="button"
							className="button"
							onClick={() =>
								results.total > 0
									? update({ page: null })
									: update({
											q: null,
											category: null,
											status: null,
											page: null,
										})
							}
						>
							{results.total > 0 ? "Go to first page" : "Clear filters"}
						</button>
					</div>
				)}
			</div>
			<nav className="listings-pagination" aria-label="Auction lot pages">
				<span>
					Showing {start}–{end} of {results.total}
				</span>
				<div className="pagination-buttons">
					<button
						type="button"
						className="button"
						disabled={loading || results.page <= 1}
						onClick={() => update({ page: String(results.page - 1) })}
					>
						Previous
					</button>
					<span>
						Page {results.page} of {Math.max(1, results.totalPages)}
					</span>
					<button
						type="button"
						className="button"
						disabled={loading || !results.hasNextPage}
						onClick={() => update({ page: String(results.page + 1) })}
					>
						Next
					</button>
				</div>
				<label className="select-control">
					Per page
					<select
						value={query.pageSize}
						onChange={(event) =>
							update({ pageSize: event.target.value, page: null })
						}
					>
						{[...new Set([12, 24, 48, query.pageSize])]
							.sort((a, b) => a - b)
							.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
					</select>
				</label>
			</nav>
		</>
	);
}
