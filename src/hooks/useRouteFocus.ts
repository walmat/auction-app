import { type RefObject, useEffect, useRef } from "react";

export function useRouteFocus(
	mainRef: RefObject<HTMLElement | null>,
	pathname: string,
) {
	const previousPath = useRef<string>(undefined);
	useEffect(() => {
		if (previousPath.current !== pathname) {
			mainRef.current?.focus({ preventScroll: true });
			previousPath.current = pathname;
		}
	}, [pathname, mainRef]);
}
