import { MAX_PHOTO_BYTES } from "../../../shared/createListing";
export async function preparePhoto(file: File): Promise<string> {
	if (
		!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
		file.size > 10_000_000
	)
		throw new Error("Choose JPG, PNG, or WebP photos up to 10 MB each.");
	const url = URL.createObjectURL(file);
	try {
		const image = new Image();
		image.src = url;
		await image.decode();
		const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(image.width * scale));
		canvas.height = Math.max(1, Math.round(image.height * scale));
		const context = canvas.getContext("2d");
		if (!context)
			throw new Error(
				"Your browser couldn't prepare this photo. Please try another browser.",
			);
		context.fillStyle = "#fff";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		for (const quality of [0.85, 0.7, 0.55, 0.4]) {
			const photo = canvas.toDataURL("image/jpeg", quality);
			if (photo.length <= Math.ceil(MAX_PHOTO_BYTES / 3) * 4) return photo;
		}
		throw new Error(
			"This photo is too large after resizing. Choose a smaller image.",
		);
	} finally {
		URL.revokeObjectURL(url);
	}
}
