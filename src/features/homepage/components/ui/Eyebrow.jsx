export default function Eyebrow({ children, tone = "default", className = "" }) {
	const toneClasses = tone === "on-dark" ? "text-theme-gold" : "text-theme-blue dark:text-theme-gold";

	return (
		<span
			className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses} ${className}`}
		>
			<span className="h-px w-6 bg-theme-gold" aria-hidden="true" />
			{children}
		</span>
	);
}
