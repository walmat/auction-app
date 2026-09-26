type Category = "tractor" | "combine" | "implement" | "attachment";
type Status = "active" | "closed" | "pending";

interface Listing {
    id: string;
    title: string;
    description: string;
    category: Category;
    startingPrice: number;
    currentBid: number;
    currentBidder: string | null;
    status: Status;
    endsAt: string;
    imageUrl: string;
}

interface BidRequest {
    bidder: string;
    amount: number;
}

interface CreateListingRequest {
    title: string;
}

interface Bid {
  id: string;
  bidderId: string;
  amount: number;
  createdAt: string;
};