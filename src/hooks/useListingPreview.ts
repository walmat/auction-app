import { useEffect, useState } from "react";

export function useListingPreview() {
	const [previewOpen, setPreviewOpen] = useState(
		() => window.matchMedia("(min-width: 901px)").matches,
	);
	useEffect(() => {
		const media = window.matchMedia("(min-width: 901px)");
		const update = () => setPreviewOpen(media.matches);
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	return { previewOpen, setPreviewOpen };
}
