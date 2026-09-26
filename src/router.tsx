import { createBrowserRouter, redirect } from "react-router-dom";
import { parseListingsQuery } from "../shared/listings";
import App from "./App";
import { getListing, getListings } from "./api/listings";
import ListingPage from "./pages/ListingPage";
import ListingsPage from "./pages/ListingsPage";
import NewListingPage from "./pages/NewListingPage";
import RouteError from "./pages/RouteError";

export const router = createBrowserRouter([
	{
		element: <App />,
		hydrateFallbackElement: (
			<p className="state-message" role="status">
				Loading lots…
			</p>
		),
		children: [
			{
				path: "/",
				loader: ({ request }) =>
					redirect(`/listings${new URL(request.url).search}`),
			},
			{
				path: "/listings",
				loader: async ({ request }) => {
					const params = new URL(request.url).searchParams;
					const query = parseListingsQuery(params);
					return { query, results: await getListings(params, request.signal) };
				},
				element: <ListingsPage />,
				errorElement: <RouteError />,
			},
			{ path: "/listings/new", element: <NewListingPage /> },
			{
				path: "/listings/:id",
				loader: ({ params, request }) => {
					if (!params.id) throw new Error("Listing not found");
					return getListing(params.id, request.signal);
				},
				element: <ListingPage />,
				errorElement: <RouteError />,
			},
			{ path: "*", element: <RouteError message="Page not found" /> },
		],
	},
]);
