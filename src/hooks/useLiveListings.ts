import { useEffect, useState } from "react";
import { useRevalidator } from "react-router-dom";

export function useLiveListings() {
	const { revalidate } = useRevalidator();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const stream = new EventSource("/api/events");
		// The server sends a message on connection too, recovering anything
		// missed between loading the page and connecting, or during an outage.
		stream.onmessage = () => {
			setConnected(true);
			revalidate();
		};
		stream.onerror = () => setConnected(false);
		window.addEventListener("focus", revalidate);
		return () => {
			stream.close();
			window.removeEventListener("focus", revalidate);
		};
	}, [revalidate]);
	return connected;
}
