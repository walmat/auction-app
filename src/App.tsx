import { useEffect, useRef } from "react";
import {
	Link,
	Outlet,
	ScrollRestoration,
	useLocation,
	useNavigation,
} from "react-router-dom";

import LiveConnection from "./components/layout/LiveConnection";

export default function App() {
	const location = useLocation();
	const navigation = useNavigation();
	const main = useRef<HTMLElement>(null);
	const previousPath = useRef<string | undefined>(undefined);
	useEffect(() => {
		if (previousPath.current !== location.pathname) {
			main.current?.focus({ preventScroll: true });
			previousPath.current = location.pathname;
		}
	}, [location.pathname]);

	return (
		<div className="app">
			<a className="skip-link" href="#main-content">
				Skip to content
			</a>
			<header className="app-header">
				<Link to="/listings" className="app-brand">
					Interview Auctions
				</Link>
				<p className="app-header__subtitle">Farm Equipment Marketplace</p>
			</header>
			<main id="main-content" ref={main} tabIndex={-1} className="page-shell">
				<div className="navigation-status" role="status">
					{navigation.state === "loading" &&
					navigation.location?.pathname !== location.pathname
						? "Loading…"
						: ""}
				</div>
				<LiveConnection />
				<Outlet />
			</main>
			<ScrollRestoration
				getKey={(location) => location.pathname + location.search}
			/>
		</div>
	);
}
