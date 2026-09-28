import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const dataDirectory =
	process.env.AUCTION_DATA_DIR ??
	join(dirname(fileURLToPath(import.meta.url)), "../data");
