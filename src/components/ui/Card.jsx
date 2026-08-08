// Deliberately dumb — just the shared card "box" (border/bg/shadow/radius)
// that dashboard tiles, filter bars, and banners were each independently
// reimplementing. Padding/layout stays the caller's job via className.
export default function Card({ className = "", children, ...props }) {
	return (
		<div
			className={`rounded-xl border border-theme-gold-light bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
