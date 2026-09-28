import cors from "cors";
import express from "express";
import { listingEvents } from "./events";
import { bidsRouter } from "./routes/bids";
import { listingsRouter } from "./routes/listings";
import { photosDirectory } from "./storage/photos";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "3mb" }));
app.use("/api/photos", express.static(photosDirectory, { dotfiles: "deny" }));

app.get("/api/events", listingEvents);
app.use("/api/listings", listingsRouter);
app.use("/api/listings/:id/bids", bidsRouter);
