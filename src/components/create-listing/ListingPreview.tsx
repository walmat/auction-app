import { categoryLabels } from "../../../shared/createListing";
import type { Category } from "../../../shared/types";
import { useListingPreview } from "../../hooks/useListingPreview";
import type { Draft } from "./useListingDraft";

interface Props {
	draft: Draft;
	priceLabel: string;
	closeLabel: string;
	zone: string;
}
export default function ListingPreview({
	draft,
	priceLabel,
	closeLabel,
	zone,
}: Props) {
	const { previewOpen, setPreviewOpen } = useListingPreview();
	return (
		<aside className="create-preview">
			<details
				open={previewOpen}
				onToggle={(event) => setPreviewOpen(event.currentTarget.open)}
			>
				<summary>Preview listing</summary>
				<div className="create-preview-content">
					<div className="create-preview-image">
						{draft.photos[0] ? (
							<img src={draft.photos[0]} alt="Listing cover preview" />
						) : null}
					</div>
					<span className="create-preview-category">
						{categoryLabels[draft.category as Category] ?? "Equipment"}
					</span>
					<h2>{draft.title.trim() || "Your equipment title"}</h2>
					<p>Starting bid</p>
					<strong className="create-preview-price">{priceLabel}</strong>
					<div className="create-preview-close">
						<span>Closes</span>
						<strong>{closeLabel}</strong>
						<span>{zone}</span>
					</div>
				</div>
			</details>
		</aside>
	);
}
