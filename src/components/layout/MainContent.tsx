import type { RefObject } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { useRouteFocus } from "../../hooks/useRouteFocus";
import LiveConnection from "./LiveConnection";

export default function MainContent({
	mainRef,
}: {
	mainRef: RefObject<HTMLElement | null>;
}) {
	const { pathname } = useLocation();
	const navigation = useNavigation();

	useRouteFocus(mainRef, pathname);

	return (
		<main id="main-content" ref={mainRef} tabIndex={-1} className="page-shell">
			<div className="navigation-status" role="status">
				{navigation.state === "loading" &&
				navigation.location?.pathname !== pathname
					? "Loading…"
					: ""}
			</div>
			<LiveConnection />
			<Outlet />
		</main>
	);
}
