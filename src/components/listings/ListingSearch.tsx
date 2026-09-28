import { useListingSearch } from "../../hooks/useListingSearch";

export default function ListingSearch({
	value,
	onSearch,
}: {
	value: string;
	onSearch: (value: string) => void;
}) {
	const { input, submit, scheduleSearch } = useListingSearch(value, onSearch);
	return (
		<search className="listing-search">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					submit(input.current?.value ?? "");
				}}
			>
				<label className="sr-only" htmlFor="lot-search">
					Search lots by title
				</label>
				<svg
					className="search-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.7"
					aria-hidden="true"
				>
					<circle cx="10.5" cy="10.5" r="6.5" />
					<path d="m16 16 4 4" />
				</svg>
				<input
					ref={input}
					id="lot-search"
					type="search"
					maxLength={200}
					defaultValue={value}
					placeholder="Search equipment, makes, models…"
					onChange={(event) => scheduleSearch(event.target.value)}
				/>
			</form>
		</search>
	);
}
