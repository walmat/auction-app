import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getListings = (): Listing[] => {
    return JSON.parse(
        readFileSync(join(__dirname, "data", "listings.json"), "utf-8"),
    );
}

export const appendListing = (listing: Listing): void => {
    return writeFileSync(
        join(__dirname, "data", "listings.json"),
        JSON.stringify([...getListings(), listing], null, 2),
    );
}

export const getListingById = (id: string): Listing | undefined => {
    const listings = getListings();
    return listings.find((l) => l.id === id);
}

export const getBids = (listingId: string): Bid[] => {
    const listing = getListingById(listingId);
    if (!listing) {
        throw new Error("Listing not found");
    }

    // NOTE: bids file gets created on listing creation, but if it doesn't exist, return an empty array
    try {
        return JSON.parse(
            readFileSync(join(__dirname, "data", "bids", `${listingId}.json`), "utf-8"),
        );
    } catch (err) {
        // TODO: Tighten this up eventually to only catch the right error
        return [];
    }
};

