import { useRef, useState } from "react";
import { MAX_PHOTOS } from "../../../shared/createListing";
import type { Category, CreateListingRequest } from "../../../shared/types";
export interface Draft {
	title: string;
	category: string;
	description: string;
	startingPrice: string;
	endsAt: string;
	photos: string[];
}
export const draftKey = "auction-listing-draft-v1";
function emptyDraft(): Draft {
	const date = new Date(Date.now() + 7 * 86400000);
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return {
		title: "",
		category: "",
		description: "",
		startingPrice: "0",
		endsAt: date.toISOString().slice(0, 16),
		photos: [],
	};
}
function readDraft(): Draft {
	const initial = emptyDraft();
	try {
		const saved = JSON.parse(localStorage.getItem(draftKey) ?? "null");
		if (!saved || typeof saved !== "object") return initial;
		for (const key of [
			"title",
			"category",
			"description",
			"startingPrice",
			"endsAt",
		] as const) {
			if (typeof saved[key] === "string") initial[key] = saved[key];
		}
		if (
			Array.isArray(saved.photos) &&
			saved.photos.length <= MAX_PHOTOS &&
			saved.photos.every(
				(photo: unknown) =>
					typeof photo === "string" &&
					photo.startsWith("data:image/jpeg;base64,"),
			)
		)
			initial.photos = saved.photos;
	} catch {
		/* Storage may be unavailable. The form remains usable. */
	}
	return initial;
}
export function requestFrom(draft: Draft): CreateListingRequest {
	const date = new Date(draft.endsAt);
	return {
		...draft,
		category: draft.category as Category,
		startingPrice: draft.startingPrice.trim()
			? Number(draft.startingPrice)
			: Number.NaN,
		endsAt: Number.isFinite(date.getTime()) ? date.toISOString() : "",
	};
}

function saveDraft(draft: Draft): string {
	try {
		localStorage.setItem(draftKey, JSON.stringify(draft));
		return "Draft saved on this device";
	} catch {
		try {
			localStorage.setItem(draftKey, JSON.stringify({ ...draft, photos: [] }));
			return "Text saved. Photos will need to be added again after a refresh.";
		} catch {
			return "Draft saving is unavailable. Keep this page open until you publish.";
		}
	}
}

export function useListingDraft() {
	const [state, setState] = useState(() => ({
		draft: readDraft(),
		saveStatus: "Changes are saved on this device as you edit.",
	}));
	const current = useRef(state.draft);
	const setDraft = (value: Draft | ((draft: Draft) => Draft)) => {
		const draft = typeof value === "function" ? value(current.current) : value;
		current.current = draft;
		setState({ draft, saveStatus: saveDraft(draft) });
	};
	return { ...state, setDraft };
}
