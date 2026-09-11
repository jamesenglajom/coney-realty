// Radial/donut chart — each `data` item is { label, value, strokeClassName,
// swatchClassName }. Built on the standard "circumference ≈ 100" SVG trick
// (r = 50/π), so each segment's stroke-dasharray/-dashoffset is just its
// share of the total in percent, no trig needed. The whole ring is rotated
// -90° so segments start at 12 o'clock instead of 3.
export default function DonutChart({ data, size = 140, thickness = 9, centerValue, centerLabel }) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	const radius = 15.915;

	let cumulativePct = 0;
	const segments = data.map((item) => {
		const pct = total > 0 ? (item.value / total) * 100 : 0;
		const segment = { ...item, pct, offset: -cumulativePct };
		cumulativePct += pct;
		return segment;
	});

	return (
		<div className="flex items-center gap-5">
			<div className="relative shrink-0" style={{ width: size, height: size }}>
				<svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
					<circle
						cx="21"
						cy="21"
						r={radius}
						fill="none"
						strokeWidth={thickness}
						className="stroke-chart-grid dark:stroke-chart-grid-dark"
					/>
					{segments
						.filter((segment) => segment.pct > 0)
						.map((segment) => (
							<circle
								key={segment.label}
								cx="21"
								cy="21"
								r={radius}
								fill="none"
								strokeWidth={thickness}
								strokeDasharray={`${segment.pct} ${100 - segment.pct}`}
								strokeDashoffset={segment.offset}
								strokeLinecap={segments.length > 1 ? "butt" : "round"}
								className={segment.strokeClassName}
							/>
						))}
				</svg>
				{centerValue != null ? (
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-xl font-extrabold leading-none text-theme-blue dark:text-white">{centerValue}</span>
						{centerLabel ? (
							<span className="mt-1 text-[10px] font-medium text-txt-muted dark:text-txt-muted-dark">{centerLabel}</span>
						) : null}
					</div>
				) : null}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-2.5">
				{data.map((item) => (
					<div key={item.label} className="flex items-center gap-2 text-xs">
						<span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${item.swatchClassName}`} aria-hidden="true" />
						<span className="min-w-0 flex-1 truncate text-txt-secondary dark:text-txt-secondary-dark">{item.label}</span>
						<span className="shrink-0 font-semibold text-txt-primary dark:text-txt-primary-dark">{item.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}
