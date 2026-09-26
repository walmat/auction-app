import { useEffect, useRef } from "react";
import {
	useLocation,
	useNavigation,
	useNavigationType,
} from "react-router-dom";

export default function ListingSearch({
	value,
	onSearch,
}: {
	value: string;
	onSearch: (value: string) => void;
}) {
	const input = useRef<HTMLInputElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const submitted = useRef(value);
	const search = useRef(onSearch);
	search.current = onSearch;
	const location = useLocation();
	const navigationType = useNavigationType();
	const navigation = useNavigation();
	const previousLocation = useRef(location.key);
	const destination = navigation.location?.pathname;
	useEffect(() => {
		if (destination && destination !== "/listings") clearTimeout(timer.current);
	}, [destination]);

	useEffect(() => {
		const wentBack =
			navigationType === "POP" && previousLocation.current !== location.key;
		previousLocation.current = location.key;
		if (wentBack) clearTimeout(timer.current);
		if (
			input.current &&
			(wentBack ||
				document.activeElement !== input.current ||
				input.current.value === submitted.current)
		) {
			input.current.value = value;
		}
	}, [value, location.key, navigationType]);
	useEffect(() => () => clearTimeout(timer.current), []);

	const submit = (text: string) => {
		submitted.current = text;
		search.current(text);
	};

	return (
		<search className="listing-search">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					clearTimeout(timer.current);
					submit(input.current?.value ?? "");
				}}
			>
				<label className="sr-only" htmlFor="lot-search">
					Search lots by title
				</label>
				<input
					ref={input}
					id="lot-search"
					type="search"
					maxLength={200}
					defaultValue={value}
					placeholder="Search lots by title…"
					onChange={(event) => {
						const text = event.target.value;
						clearTimeout(timer.current);
						timer.current = setTimeout(() => submit(text), 300);
					}}
				/>
			</form>
		</search>
	);
}
