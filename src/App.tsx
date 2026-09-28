import { useRef } from "react";
import { ScrollRestoration } from "react-router-dom";
import AppHeader from "./components/layout/AppHeader";
import MainContent from "./components/layout/MainContent";
import { useHeaderHeight } from "./hooks/useHeaderHeight";

export default function App() {
	const header = useRef<HTMLElement>(null);
	const main = useRef<HTMLElement>(null);
	useHeaderHeight(header, main);
	return (
		<div className="app">
			<a className="skip-link" href="#main-content">
				Skip to content
			</a>
			<AppHeader headerRef={header} />
			<MainContent mainRef={main} />
			<ScrollRestoration
				getKey={(location) => location.pathname + location.search}
			/>
		</div>
	);
}
