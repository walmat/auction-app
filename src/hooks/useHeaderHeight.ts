import { type RefObject, useEffect } from "react";

export function useHeaderHeight(
	header: RefObject<HTMLElement | null>,
	main: RefObject<HTMLElement | null>,
) {
	useEffect(() => {
		const element = header.current;
		if (!element) return;
		const updateHeaderHeight = () => {
			main.current?.style.setProperty(
				"--app-header-height",
				`${element.getBoundingClientRect().height}px`,
			);
		};
		updateHeaderHeight();
		const observer = new ResizeObserver(updateHeaderHeight);
		observer.observe(element);
		return () => observer.disconnect();
	}, [header, main]);
}
