import { useLiveListings } from "../../hooks/useLiveListings";

export default function LiveConnection() {
	const connected = useLiveListings();
	return connected ? null : (
		<p role="status" className="connection-notice">
			Connecting to live updates… Bids may be out of date.
		</p>
	);
}
