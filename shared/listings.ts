import { NUMERICAL_REGEX } from "./regex";
import type { Category, Status } from "./types";

export const categories: Category[] = [
	"tractor",
	"combine",
	"implement",
	"attachment",
];
export const statuses: Status[] = ["active", "closed", "pending"];
export const listingSorts = [
	"ending-soonest",
	"bid-lowest",
	"bid-highest",
] as const;
export type ListingSort = (typeof listingSorts)[number];

export interface ListingFilters {
	q: string;
	category: Category[];
	status: Status[];
}

export interface ListingsQuery extends ListingFilters {
	page: number;
	pageSize: number;
	sort: ListingSort;
}

export function parseListingsQuery(params: URLSearchParams): ListingsQuery {
	const single = (key: string, fallback: string): string => {
		if (params.getAll(key).length > 1)
			throw new Error(`${key} must appear only once`);
		return params.get(key) ?? fallback;
	};
	const positiveInteger = (
		key: string,
		fallback: string,
		max: number,
	): number => {
		const value = single(key, fallback);
		const number = Number(value);
		if (
			!NUMERICAL_REGEX.test(value) ||
			!Number.isSafeInteger(number) ||
			number < 1 ||
			number > max
		) {
			throw new Error(`${key} must be an integer from 1 to ${max}`);
		}
		return number;
	};
	const choices = <T extends string>(
		key: string,
		allowed: readonly T[],
	): T[] => {
		const values = params.getAll(key);
		if (values.some((value) => !allowed.includes(value as T))) {
			throw new Error(`Invalid ${key} filter`);
		}
		return [...new Set(values)] as T[];
	};
	const pageSize = positiveInteger("pageSize", "12", 100);
	const page = positiveInteger(
		"page",
		"1",
		Math.floor(Number.MAX_SAFE_INTEGER / pageSize),
	);
	const q = single("q", "").trim();
	if (q.length > 200) throw new Error("Search must be 200 characters or fewer");
	const sort = single("sort", "ending-soonest");
	if (!listingSorts.includes(sort as ListingSort))
		throw new Error("Invalid sort order");
	return {
		page,
		pageSize,
		q,
		category: choices("category", categories),
		status: choices("status", statuses),
		sort: sort as ListingSort,
	};
}
