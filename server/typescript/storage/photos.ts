import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDirectory } from "./paths";

export const photosDirectory = join(dataDirectory, "photos");
export function savePhotos(id: string, photos: string[]): string[] {
	const directory = join(photosDirectory, id);
	try {
		if (photos.length) mkdirSync(directory, { recursive: true });
		return photos.map((photo, index) => {
			writeFileSync(
				join(directory, `${index}.jpg`),
				Buffer.from(photo.split(",")[1], "base64"),
			);
			return `/api/photos/${id}/${index}.jpg`;
		});
	} catch (error) {
		removePhotos(id);
		throw error;
	}
}
export function removePhotos(id: string) {
	rmSync(join(photosDirectory, id), { recursive: true, force: true });
}
