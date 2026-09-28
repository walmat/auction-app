import cors from "cors";
import express from "express";
import { bidsRouter } from "./routes/bids";
import { listingsRouter } from "./routes/listings";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/listings", listingsRouter);
app.use("/api/listings/:id/bids", bidsRouter);
