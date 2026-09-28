import * as Select from "@radix-ui/react-select";
import { categoryLabels } from "../../../shared/createListing";

interface Props {
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	disabled: boolean;
	error?: string;
}

export default function CategorySelect({
	value,
	onChange,
	onBlur,
	disabled,
	error,
}: Props) {
	return (
		<Select.Root
			name="category"
			value={value}
			onValueChange={onChange}
			disabled={disabled}
			required
		>
			<Select.Trigger
				id="create-category"
				className="create-select-trigger"
				aria-invalid={Boolean(error)}
				aria-describedby={error ? "create-category-error" : undefined}
				onBlur={onBlur}
			>
				<Select.Value placeholder="Select a category" />
				<Select.Icon aria-hidden="true">
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</Select.Icon>
			</Select.Trigger>
			<Select.Portal>
				<Select.Content
					className="sort-menu create-select-menu"
					position="popper"
					align="start"
					sideOffset={6}
					collisionPadding={16}
				>
					<Select.Viewport>
						{Object.entries(categoryLabels).map(([value, label]) => (
							<Select.Item key={value} value={value} className="sort-option">
								<Select.ItemText>{label}</Select.ItemText>
								<Select.ItemIndicator className="sort-option__check">
									<span aria-hidden="true">✓</span>
								</Select.ItemIndicator>
							</Select.Item>
						))}
					</Select.Viewport>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
}
