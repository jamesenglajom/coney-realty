// Deliberately dumb — just the shared card "box" (border/bg/shadow/radius)
// that dashboard tiles, filter bars, and banners were each independently
// reimplementing. Padding/layout stays the caller's job via className.
export default function Card({ className = "", children, ...props }) {
	return (
		<div
			className={`rounded-2xl border border-theme-gold-light/70 bg-white shadow-[0_1px_2px_rgba(20,20,20,.04),0_10px_24px_-16px_rgba(20,20,20,.10)] dark:border-border-dark dark:bg-surface-dark dark:shadow-[0_1px_2px_rgba(0,0,0,.3),0_12px_28px_-16px_rgba(0,0,0,.5)] ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
