import { useEffect, useState } from "react";
import type { BidHistoryResponse } from "../../shared/types";
import { getBidHistory } from "../api/listings";

export function useBidHistory(listingId: string) {
	const [cursors, setCursors] = useState<(string | null)[]>([null]);
	const [page, setPage] = useState<BidHistoryResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [request, setRequest] = useState<{ before: string | null }>({
		before: null,
	});
	const loading = page === null && error === null;

	useEffect(() => {
		const controller = new AbortController();
		getBidHistory(listingId, request.before, controller.signal)
			.then((data) => {
				if (!controller.signal.aborted) setPage(data);
			})
			.catch((err: unknown) => {
				if (!controller.signal.aborted) {
					setError(
						err instanceof Error ? err.message : "Failed to load bid history",
					);
				}
			});
		return () => controller.abort();
	}, [listingId, request]);

	const navigate = (next: (string | null)[]) => {
		setPage(null);
		setError(null);
		setCursors(next);
		setRequest({ before: next[next.length - 1] });
	};

	const retry = () => {
		setError(null);
		setRequest({ ...request });
	};
	return { cursors, page, error, loading, navigate, retry };
}
