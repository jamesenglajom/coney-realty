export default function Select({ className = "", children, ...props }) {
	return (
		<select
			className={`w-full rounded-xl border border-theme-gray/25 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-all hover:border-theme-gray/45 focus:border-theme-blue focus:ring-4 focus:ring-theme-blue/10 disabled:opacity-50 disabled:hover:border-theme-gray/25 dark:border-border-dark dark:bg-surface-dark-raised dark:text-txt-primary-dark dark:hover:border-theme-gold/25 dark:focus:border-theme-gold dark:focus:ring-theme-gold/10 ${className}`}
			{...props}
		>
			{children}
		</select>
	);
}
