import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CreateListingForm from "../components/CreateListingForm";
import { returnToListings } from "./ListingPage";

export default function NewListingPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const from = returnToListings(location.state);
	useEffect(() => {
		document.title = "New lot · Interview Auctions";
	}, []);
	return (
		<div className="detail-page">
			<Link className="back-link" to={from}>
				← Back to lots
			</Link>
			<h1 className="page-title">Create a lot</h1>
			<CreateListingForm
				onSuccess={(listing) =>
					navigate(`/listings/${listing.id}`, {
						replace: true,
						state: { from },
					})
				}
			/>
		</div>
	);
}
