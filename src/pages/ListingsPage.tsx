import {
	useLoaderData,
	useLocation,
	useNavigate,
	useNavigation,
} from "react-router-dom";
import {
	categories,
	type ListingsQuery,
	parseListingsQuery,
} from "../../shared/listings";
import type { ListingsResponse } from "../../shared/types";
import ListingCard from "../components/listings/ListingCard";
import ListingFilters from "../components/listings/ListingFilters";
import ListingSort from "../components/listings/ListingSort";

export default function ListingsPage() {
	const { results } = useLoaderData<{
		query: ListingsQuery;
		results: ListingsResponse;
	}>();
	const location = useLocation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const pendingSearch =
		navigation.location?.pathname === "/listings"
			? navigation.location.search
			: location.search;
	const query = parseListingsQuery(new URLSearchParams(pendingSearch));
	const loading = navigation.state !== "idle";

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
			<title>Auction lots · Interview Auctions</title>
			<nav className="category-nav" aria-label="Equipment categories">
				<button
					type="button"
					aria-pressed={query.category.length === 0}
					onClick={() => update({ category: null, page: null })}
				>
					All equipment
				</button>
				{categories.map((category) => (
					<button
						key={category}
						type="button"
						aria-pressed={
							query.category.length === 1 && query.category[0] === category
						}
						onClick={() => update({ category, page: null })}
					>
						{category === "attachment"
							? "Attachments"
							: category === "implement"
								? "Implements"
								: category === "combine"
									? "Combines"
									: "Tractors"}
					</button>
				))}
			</nav>
			<div className="page-heading">
				<div>
					<h1>Auction listings</h1>
					<p>Find the right equipment for your next season.</p>
				</div>
			</div>
			<div className="listing-toolbar">
				<fieldset className="auction-switch" aria-label="Auction status">
					{(
						[
							{ label: "All auctions", value: null },
							{ label: "Active", value: "active" },
							{ label: "Closed", value: "closed" },
						] as const
					).map(({ label, value }) => (
						<button
							type="button"
							key={label}
							aria-pressed={
								value === null
									? query.status.length === 0
									: query.status.length === 1 && query.status[0] === value
							}
							onClick={() => update({ status: value, page: null })}
						>
							{label}
						</button>
					))}
				</fieldset>
				<ListingFilters
					filters={query}
					onChange={(field, values) => update({ [field]: values, page: null })}
					onClear={() =>
						update({ q: null, category: null, status: null, page: null })
					}
				/>
				<ListingSort
					value={query.sort}
					onChange={(sort) => update({ sort, page: null })}
				/>
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
