import Link from "next/link";

const VARIANT_CLASSES = {
	primary:
		"bg-theme-blue text-white hover:bg-theme-blue/90 dark:bg-theme-gold dark:text-theme-blue dark:hover:bg-theme-gold/90",
	brass: "bg-theme-gold text-theme-blue hover:brightness-105",
	ghost:
		"border border-theme-gray/30 text-current hover:border-theme-gray/60 dark:border-white/20 dark:hover:border-white/40",
	danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_CLASSES = {
	md: "rounded-full px-6 py-3 text-sm",
	sm: "rounded-lg px-3.5 py-2 text-xs",
};

const BASE_CLASSES = "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";

function isRawAnchorHref(href) {
	return /^(https?:|tel:|mailto:)/.test(href ?? "");
}

export default function Button({ href, variant = "primary", size = "md", className = "", children, type, ...props }) {
	const classes = `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;

	if (href && isRawAnchorHref(href)) {
		return (
			<a href={href} className={classes} {...props}>
				{children}
			</a>
		);
	}

	if (href) {
		return (
			<Link href={href} className={classes} {...props}>
				{children}
			</Link>
		);
	}

	return (
		<button type={type ?? "button"} className={classes} {...props}>
			{children}
		</button>
	);
}
