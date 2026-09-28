import { ISO_DATETIME_REGEX, JPEG_DATA_URL_REGEX } from "./regex";
import type { Category, CreateListingRequest } from "./types";

export const MAX_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 500_000;
export const categoryLabels: Record<Category, string> = {
	tractor: "Tractor",
	combine: "Combine",
	implement: "Implement",
	attachment: "Attachment",
};
export type ListingField =
	| "title"
	| "category"
	| "description"
	| "startingPrice"
	| "endsAt"
	| "photos";
export type ListingErrors = Partial<Record<ListingField, string>>;

export function validateCreateListing(
	input: unknown,
	now = Date.now(),
): ListingErrors {
	const data = (
		input && typeof input === "object" ? input : {}
	) as Partial<CreateListingRequest>;
	const errors: ListingErrors = {};
	if (
		typeof data.title !== "string" ||
		data.title.trim().length < 5 ||
		data.title.trim().length > 120
	)
		errors.title = "Enter a title between 5 and 120 characters.";
	if (
		typeof data.category !== "string" ||
		!Object.keys(categoryLabels).includes(data.category)
	)
		errors.category = "Choose an equipment category.";
	if (
		typeof data.description !== "string" ||
		!data.description.trim() ||
		data.description.trim().length > 5000
	)
		errors.description = "Describe your equipment using 1–5,000 characters.";
	if (
		typeof data.startingPrice !== "number" ||
		!Number.isFinite(data.startingPrice) ||
		data.startingPrice < 0 ||
		data.startingPrice > 999_999_999.99 ||
		Math.abs(data.startingPrice * 100 - Math.round(data.startingPrice * 100)) >
			0.00001
	)
		errors.startingPrice =
			"Enter a price from $0 to $999,999,999.99 with up to two decimal places.";
	if (
		typeof data.endsAt !== "string" ||
		!ISO_DATETIME_REGEX.test(data.endsAt) ||
		!(Date.parse(data.endsAt) > now)
	)
		errors.endsAt = "Choose a closing date and time in the future.";
	if (
		!Array.isArray(data.photos) ||
		data.photos.length > MAX_PHOTOS ||
		data.photos.some(
			(photo) =>
				typeof photo !== "string" ||
				photo.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 30 ||
				!JPEG_DATA_URL_REGEX.test(photo),
		)
	)
		errors.photos = "Add up to four JPEG photos";
	return errors;
}
