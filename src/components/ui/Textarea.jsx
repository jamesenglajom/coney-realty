export default function Textarea({ className = "", ...props }) {
	return (
		<textarea
			className={`w-full rounded-xl border border-theme-gray/30 bg-white px-3.5 py-2.5 text-sm text-txt-primary outline-none transition-colors focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-theme-gold dark:focus:ring-theme-gold/20 ${className}`}
			{...props}
		/>
	);
}
