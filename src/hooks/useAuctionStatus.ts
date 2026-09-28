import { useEffect, useState } from "react";
import { auctionStatus } from "../../shared/auction";
import type { Listing } from "../../shared/types";

export function useAuctionStatus(listing: Listing) {
	const [now, setNow] = useState(Date.now);
	const { endsAt, status } = listing;
	useEffect(() => {
		if (status !== "active") return;
		let timer: ReturnType<typeof setTimeout>;
		const checkDeadline = () => {
			clearTimeout(timer);
			const time = Date.now();
			setNow(time);
			const remaining = Date.parse(endsAt) - time;
			if (remaining > 0)
				timer = setTimeout(checkDeadline, Math.min(remaining, 2_147_483_647));
		};
		checkDeadline();
		window.addEventListener("focus", checkDeadline);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("focus", checkDeadline);
		};
	}, [endsAt, status]);
	return auctionStatus(listing, now);
}
