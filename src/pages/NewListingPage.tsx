import { Link, useLocation, useNavigate } from "react-router-dom";
import CreateListingForm from "../components/create-listing/CreateListingForm";
import { returnToListings } from "../navigation";

export default function NewListingPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const from = returnToListings(location.state);

	return (
		<div className="detail-page create-page">
			<title>New lot · Interview Auctions</title>
			<Link className="back-link" to={from}>
				← Back to lots
			</Link>
			<div className="create-heading">
				<h1 className="page-title">Create a listing</h1>
			</div>
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
