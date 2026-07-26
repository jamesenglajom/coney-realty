export default function Label({ className = "", ...props }) {
	return (
		<label
			className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide text-txt-secondary dark:text-txt-secondary-dark ${className}`}
			{...props}
		/>
	);
}
