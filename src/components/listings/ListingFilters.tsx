import * as Popover from "@radix-ui/react-popover";
import { useRef, useState } from "react";
import {
	categories,
	type ListingFilters as Filters,
	statuses,
} from "../../../shared/listings";

interface Props {
	filters: Filters;
	onChange: (field: "category" | "status", values: string[]) => void;
	onClear: () => void;
}

const fields = [
	{ key: "category", label: "Category", options: categories },
	{ key: "status", label: "Status", options: statuses },
] as const;

const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function ListingFilters({ filters, onChange, onClear }: Props) {
	const addFilter = useRef<HTMLButtonElement>(null);
	const [editing, setEditing] = useState<string | null>(null);
	const options = (field: (typeof fields)[number]) => (
		<fieldset className="filter-options" key={field.key}>
			<legend>{field.label}</legend>
			{field.options.map((value) => (
				<label key={value}>
					<input
						type="checkbox"
						checked={(filters[field.key] as string[]).includes(value)}
						onChange={(event) =>
							onChange(
								field.key,
								event.target.checked
									? [...filters[field.key], value]
									: filters[field.key].filter((selected) => selected !== value),
							)
						}
					/>
					{label(value)}
				</label>
			))}
		</fieldset>
	);

	return (
		<section className="filter-bar" aria-label="Listing filters">
			<Popover.Root>
				<Popover.Trigger ref={addFilter} className="button button--subtle">
					+ Filter
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content
						className="filter-popover"
						sideOffset={8}
						align="start"
						aria-label="Add filters"
					>
						{fields.map(options)}
						<Popover.Close className="button">Done</Popover.Close>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>
			{fields
				.filter(
					(field) => filters[field.key].length > 0 || editing === field.key,
				)
				.map((field) => (
					<div className="filter-chip" key={field.key}>
						<Popover.Root
							open={editing === field.key}
							onOpenChange={(open) => setEditing(open ? field.key : null)}
						>
							<Popover.Trigger className="filter-chip__edit">
								{field.label}:{" "}
								<strong>
									{filters[field.key].map(label).join(", ") || "Any"}
								</strong>
							</Popover.Trigger>
							<Popover.Portal>
								<Popover.Content
									className="filter-popover"
									sideOffset={8}
									align="start"
									aria-label={`Edit ${field.label.toLowerCase()} filter`}
									onCloseAutoFocus={(event) => {
										if (filters[field.key].length === 0) {
											event.preventDefault();
											addFilter.current?.focus();
										}
									}}
								>
									{options(field)}
									<Popover.Close className="button">Done</Popover.Close>
								</Popover.Content>
							</Popover.Portal>
						</Popover.Root>
						<button
							type="button"
							className="filter-chip__remove"
							aria-label={`Remove ${field.label.toLowerCase()} filter`}
							onClick={() => {
								onChange(field.key, []);
								addFilter.current?.focus();
							}}
						>
							×
						</button>
					</div>
				))}
			{(filters.q ||
				filters.category.length > 0 ||
				filters.status.length > 0) && (
				<button
					className="button button--plain"
					type="button"
					onClick={() => {
						onClear();
						addFilter.current?.focus();
					}}
				>
					Clear filters
				</button>
			)}
		</section>
	);
}
