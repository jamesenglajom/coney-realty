import Link from "next/link";

const VARIANT_CLASSES = {
	primary:
		"bg-theme-blue text-white hover:bg-theme-blue/90 dark:bg-theme-gold dark:text-theme-blue dark:hover:bg-theme-gold/90",
	brass: "bg-theme-gold text-theme-blue hover:brightness-105 dark:hover:brightness-110",
	ghost:
		"border border-theme-gray/30 text-current hover:border-theme-gray/60 dark:border-white/20 dark:hover:border-white/40",
	danger: "bg-danger text-white hover:bg-danger/90 dark:bg-danger-dark dark:text-theme-blue dark:hover:bg-danger-dark/90",
};

const SIZE_CLASSES = {
	md: "px-6 py-3 text-sm",
	sm: "px-3.5 py-2 text-xs",
};

// Radius is an independent choice from size — `shape` defaults per size to
// today's existing look (md stayed a pill, sm stayed rounded-lg) so every
// current call site renders unchanged, but either size can now opt into the
// other shape explicitly.
const SHAPE_CLASSES = {
	pill: "rounded-full",
	rounded: "rounded-lg",
};

const DEFAULT_SHAPE_BY_SIZE = {
	md: "pill",
	sm: "rounded",
};

const BASE_CLASSES =
	"inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black";

function isRawAnchorHref(href) {
	return /^(https?:|tel:|mailto:)/.test(href ?? "");
}

export default function Button({
	href,
	variant = "primary",
	size = "md",
	shape,
	className = "",
	children,
	type,
	...props
}) {
	const resolvedShape = shape ?? DEFAULT_SHAPE_BY_SIZE[size];
	const classes = `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${SHAPE_CLASSES[resolvedShape]} ${VARIANT_CLASSES[variant]} ${className}`;

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
