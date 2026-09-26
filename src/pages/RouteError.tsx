import { Link, useRouteError } from "react-router-dom";

export default function RouteError({ message }: { message?: string }) {
	const error = useRouteError();
	return (
		<section className="page-error">
			<h1>Unable to open this page</h1>
			<p role="alert">
				{message ??
					(error instanceof Error ? error.message : "Something went wrong")}
			</p>
			<button type="button" onClick={() => window.location.reload()}>
				Try again
			</button>
			<Link to="/listings">Back to all lots</Link>
		</section>
	);
}
