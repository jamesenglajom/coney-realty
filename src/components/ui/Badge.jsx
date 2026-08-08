const TONE_CLASSES = {
	success: "bg-success/15 text-success dark:bg-success-dark/20 dark:text-success-dark",
	warning: "bg-warning/15 text-warning dark:bg-warning-dark/20 dark:text-warning-dark",
	danger: "bg-danger/15 text-danger dark:bg-danger-dark/20 dark:text-danger-dark",
	neutral: "bg-theme-gray/15 text-txt-secondary dark:text-txt-secondary-dark",
	gold: "bg-theme-gold/20 text-theme-blue dark:text-theme-gold",
};

// Shared pill for status/role/method badges — `tone` covers the common
// cases; pass `className` instead (or alongside, to extend) for anything
// with its own established color set, e.g. property status already has
// dedicated chart-status-* tokens shared with the dashboard chart.
export default function Badge({ tone, className = "", children }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone ? TONE_CLASSES[tone] : ""} ${className}`}
		>
			{children}
		</span>
	);
}
