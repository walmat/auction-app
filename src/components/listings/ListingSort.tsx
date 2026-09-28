import * as Select from "@radix-ui/react-select";
import type { ListingSort as Sort } from "../../../shared/listings";

const options: { value: Sort; label: string }[] = [
	{ value: "ending-soonest", label: "Ending soonest" },
	{ value: "bid-lowest", label: "Current bid: low to high" },
	{ value: "bid-highest", label: "Current bid: high to low" },
];

export default function ListingSort({
	value,
	onChange,
}: {
	value: Sort;
	onChange: (value: string) => void;
}) {
	return (
		<div className="listing-sort">
			<Select.Root value={value} onValueChange={onChange}>
				<Select.Trigger className="sort-trigger" aria-label="Sort auctions">
					<span className="sort-trigger__label">Sort by</span>
					<Select.Value />
					<Select.Icon className="sort-trigger__icon">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							aria-hidden="true"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</Select.Icon>
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						className="sort-menu"
						position="popper"
						align="end"
						sideOffset={8}
						collisionPadding={16}
					>
						<Select.Viewport>
							{options.map((option) => (
								<Select.Item
									key={option.value}
									value={option.value}
									className="sort-option"
								>
									<Select.ItemText>{option.label}</Select.ItemText>
									<Select.ItemIndicator className="sort-option__check">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											aria-hidden="true"
										>
											<path d="m5 12 4 4L19 6" />
										</svg>
									</Select.ItemIndicator>
								</Select.Item>
							))}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</div>
	);
}
