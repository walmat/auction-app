import { useEffect, useState } from "react";
import { formatTimeRemaining } from "../../shared/auction";

export function useCountdown(endsAt: string) {
	const [now, setNow] = useState(Date.now);
	useEffect(() => {
		const tick = () => setNow(Date.now());
		const timer = window.setInterval(tick, 1000);
		window.addEventListener("focus", tick);
		return () => {
			window.clearInterval(timer);
			window.removeEventListener("focus", tick);
		};
	}, []);
	return formatTimeRemaining(endsAt, now);
}
