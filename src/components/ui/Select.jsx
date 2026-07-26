export default function Select({ className = "", children, ...props }) {
	return (
		<select
			className={`w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold ${className}`}
			{...props}
		>
			{children}
		</select>
	);
}
