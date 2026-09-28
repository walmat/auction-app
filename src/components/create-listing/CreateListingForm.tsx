import { useRef, useState } from "react";
import {
	type ListingErrors,
	type ListingField,
	MAX_PHOTOS,
	validateCreateListing,
} from "../../../shared/createListing";
import type { Listing } from "../../../shared/types";
import { createListing } from "../../api/listings";
import CategorySelect from "./CategorySelect";
import ListingPreview from "./ListingPreview";
import { preparePhoto } from "./preparePhoto";
import { draftKey, requestFrom, useListingDraft } from "./useListingDraft";

interface Props {
	onSuccess: (listing: Listing) => void;
}
export default function CreateListingForm({ onSuccess }: Props) {
	const { draft, setDraft, saveStatus } = useListingDraft();
	const [errors, setErrors] = useState<ListingErrors>({});
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [processing, setProcessing] = useState(false);
	const form = useRef<HTMLFormElement>(null);
	const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const request = requestFrom(draft);
	const closeLabel = request.endsAt
		? new Date(request.endsAt).toLocaleString(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
			})
		: "Choose a closing time";
	const priceLabel =
		Number.isFinite(request.startingPrice) && request.startingPrice >= 0
			? new Intl.NumberFormat(undefined, {
					style: "currency",
					currency: "USD",
				}).format(request.startingPrice)
			: "Set a starting bid";

	const update = (field: Exclude<ListingField, "photos">, value: string) => {
		const next = { ...draft, [field]: value };
		setDraft(next);
		if (errors[field])
			setErrors((current) => ({
				...current,
				[field]: validateCreateListing(requestFrom(next))[field],
			}));
	};
	const fieldProps = (field: Exclude<ListingField, "photos">) => ({
		id: `create-${field}`,
		name: field,
		value: draft[field],
		required: true,
		disabled: submitting,
		"aria-invalid": Boolean(errors[field]),
		"aria-describedby":
			[
				field === "startingPrice" || field === "endsAt"
					? `create-${field}-hint`
					: "",
				errors[field] ? `create-${field}-error` : "",
			]
				.filter(Boolean)
				.join(" ") || undefined,
		onChange: (
			event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		) => update(field, event.target.value),
		onBlur: () =>
			setErrors((current) => ({
				...current,
				[field]: validateCreateListing(requestFrom(draft))[field],
			})),
	});
	const fieldError = (field: ListingField) =>
		errors[field] ? (
			<p className="create-error" id={`create-${field}-error`} role="alert">
				{errors[field]}
			</p>
		) : null;
	const addPhotos = async (files: FileList | null) => {
		if (!files?.length) return;
		if (files.length + draft.photos.length > MAX_PHOTOS) {
			setErrors((current) => ({
				...current,
				photos:
					"You can add up to four photos. Remove one before adding another.",
			}));
			return;
		}
		setProcessing(true);
		setErrors((current) => ({ ...current, photos: undefined }));
		try {
			const photos = await Promise.all(Array.from(files, preparePhoto));
			setDraft((current) => ({
				...current,
				photos: [...new Set([...current.photos, ...photos])],
			}));
		} catch (cause) {
			setErrors((current) => ({
				...current,
				photos:
					cause instanceof Error
						? cause.message
						: "Couldn't read this photo. Try another image.",
			}));
		} finally {
			setProcessing(false);
		}
	};
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting || processing) return;
		setError(null);
		const issues = validateCreateListing(requestFrom(draft));
		setErrors(issues);
		const first = Object.keys(issues)[0];
		if (first) {
			setError("Please check the highlighted fields before publishing.");
			form.current?.querySelector<HTMLElement>(`#create-${first}`)?.focus();
			return;
		}
		setSubmitting(true);
		try {
			const listing = await createListing(requestFrom(draft));
			try {
				localStorage.removeItem(draftKey);
			} catch {
				/* Publishing still succeeded. */
			}
			onSuccess(listing);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Couldn't publish. Your entries have been kept; please try again.",
			);
			setSubmitting(false);
		}
	};

	return (
		<form
			className="create-layout"
			ref={form}
			onSubmit={handleSubmit}
			noValidate
			aria-busy={submitting}
		>
			<section
				className="create-section create-equipment"
				aria-labelledby="equipment-heading"
			>
				<div className="create-section-heading">
					<span aria-hidden="true">01</span>
					<div>
						<h2 id="equipment-heading">The equipment</h2>
					</div>
				</div>
				<div className="create-field">
					<label htmlFor="create-title">Listing title</label>
					<input
						{...fieldProps("title")}
						maxLength={120}
						placeholder="e.g. 2018 John Deere 6120M"
					/>
					{fieldError("title")}
				</div>
				<div className="create-field">
					<label htmlFor="create-category">Category</label>
					<CategorySelect
						value={draft.category}
						onChange={(value) => update("category", value)}
						onBlur={fieldProps("category").onBlur}
						disabled={submitting}
						error={errors.category}
					/>
					{fieldError("category")}
				</div>
				<div className="create-field">
					<label htmlFor="create-description">Description</label>
					<textarea
						{...fieldProps("description")}
						maxLength={5000}
						rows={5}
						placeholder="What should a buyer know about this equipment?"
					/>
					{fieldError("description")}
				</div>
				<div className="create-field">
					<label htmlFor="create-photos">
						Photos <span className="create-optional">(Optional)</span>
					</label>
					<p id="create-photos-hint">
						Up to four JPG, PNG, or WebP photos, 10 MB limit per file
					</p>
					<input
						id="create-photos"
						className="create-photo-input"
						type="file"
						multiple
						accept="image/jpeg,image/png,image/webp"
						disabled={
							submitting || processing || draft.photos.length >= MAX_PHOTOS
						}
						aria-invalid={Boolean(errors.photos)}
						aria-describedby={`create-photos-hint${errors.photos ? " create-photos-error" : ""}`}
						onChange={(event) => {
							void addPhotos(event.target.files);
							event.target.value = "";
						}}
					/>
					<div className="create-photos">
						{draft.photos.map((photo, index) => (
							<div className="create-photo" key={photo}>
								<img src={photo} alt={`Equipment view ${index + 1}`} />
								<div>
									<button
										type="button"
										disabled={submitting || processing || index === 0}
										onClick={() =>
											setDraft((current) => ({
												...current,
												photos: [
													photo,
													...current.photos.filter((_, i) => i !== index),
												],
											}))
										}
									>
										{index === 0 ? "Cover photo" : "Make cover"}
									</button>
									<button
										type="button"
										aria-label={`Remove photo ${index + 1}`}
										disabled={submitting || processing}
										onClick={() => {
											setDraft((current) => ({
												...current,
												photos: current.photos.filter((_, i) => i !== index),
											}));
											setErrors((current) => ({
												...current,
												photos: undefined,
											}));
										}}
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
					{fieldError("photos")}
				</div>
			</section>
			<section
				className="create-section create-auction"
				aria-labelledby="auction-heading"
			>
				<div className="create-section-heading">
					<span aria-hidden="true">02</span>
					<div>
						<h2 id="auction-heading">Set up the auction</h2>
					</div>
				</div>
				<div className="create-field">
					<label htmlFor="create-startingPrice">Starting bid (USD)</label>
					<input
						{...fieldProps("startingPrice")}
						type="number"
						inputMode="decimal"
						min="0"
						max="999999999.99"
						step="0.01"
					/>
					{fieldError("startingPrice")}
				</div>
				<div className="create-field">
					<label htmlFor="create-endsAt">Closing date and time</label>
					<input {...fieldProps("endsAt")} type="datetime-local" />
					<p id="create-endsAt-hint">Your timezone is: {zone}</p>
					{fieldError("endsAt")}
				</div>
			</section>
			<ListingPreview
				draft={draft}
				priceLabel={priceLabel}
				closeLabel={closeLabel}
				zone={zone}
			/>
			<section
				className="create-section create-review"
				aria-labelledby="review-heading"
			>
				<div className="create-section-heading">
					<span aria-hidden="true">03</span>
					<div>
						<h2 id="review-heading">Review</h2>
					</div>
				</div>
				<dl className="create-summary">
					<div>
						<dt>Starting bid</dt>
						<dd>{priceLabel}</dd>
					</div>
					<div>
						<dt>Bidding closes</dt>
						<dd>
							{closeLabel}
							<small>{zone}</small>
						</dd>
					</div>
				</dl>
				{error && (
					<p className="bid-form__error" role="alert">
						{error}
					</p>
				)}
				<button
					className="button button--primary create-publish"
					type="submit"
					disabled={submitting || processing}
				>
					{submitting ? "Publishing…" : "Publish listing"}
					<span aria-hidden="true">↗</span>
				</button>
				<p className="create-save-status" role="status">
					{saveStatus}
				</p>
			</section>
		</form>
	);
}
