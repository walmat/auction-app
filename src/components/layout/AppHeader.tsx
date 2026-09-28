import type { Ref } from "react";
import {
	Link,
	useLocation,
	useNavigate,
	useNavigation,
} from "react-router-dom";
import ListingSearch from "../listings/ListingSearch";

export default function AppHeader({
	headerRef,
}: {
	headerRef: Ref<HTMLElement>;
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	return (
		<header ref={headerRef} className="app-header">
			<div className="app-header__inner">
				<Link to="/listings" className="app-brand">
					<span className="app-brand__mark" aria-hidden="true">
						i a
					</span>
					<span>
						Interview Auctions
						<span className="app-brand__subtitle">
							Open bidding. No hassle.
						</span>
					</span>
				</Link>
				<ListingSearch
					value={
						location.pathname === "/listings"
							? (new URLSearchParams(location.search).get("q") ?? "")
							: ""
					}
					onSearch={(q) => {
						const search =
							navigation.location?.pathname === "/listings"
								? navigation.location.search
								: location.pathname === "/listings"
									? location.search
									: "";
						const params = new URLSearchParams(search);
						params.delete("page");
						if (q.trim()) params.set("q", q.trim());
						else params.delete("q");
						void navigate(
							{ pathname: "/listings", search: params.toString() },
							{
								replace: location.pathname === "/listings",
								preventScrollReset: true,
							},
						);
					}}
				/>
				<Link
					to="/listings/new"
					state={{ from: location.pathname + location.search }}
					className="button button--primary header-sell"
				>
					List your equipment <span aria-hidden="true">↗</span>
				</Link>
			</div>
		</header>
	);
}
