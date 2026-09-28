import { useCountdown } from "../../hooks/useCountdown";

export default function AuctionCountdown({ endsAt }: { endsAt: string }) {
	return useCountdown(endsAt);
}
