// Same Catmull-Rom -> Bezier smoothing TrendChart uses, sized down for a KPI
// tile's compact preview slot — no axis labels or hover state here.
function smoothPath(points) {
	if (points.length < 2) return "";
	if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

	let path = `M ${points[0].x} ${points[0].y}`;
	for (let i = 0; i < points.length - 1; i += 1) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;

		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;

		path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
	}
	return path;
}

export default function Sparkline({ data, strokeClassName, fillClassName, height = 44 }) {
	const values = data.map((point) => point.count);
	const max = Math.max(1, ...values);

	const points = values.map((value, index) => ({
		x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
		y: 92 - (value / max) * 78,
	}));

	const linePath = smoothPath(points);
	const areaPath = `${linePath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
	const last = points[points.length - 1];

	return (
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className="w-full overflow-visible">
			<path d={areaPath} className={fillClassName} stroke="none" opacity="0.18" />
			<path
				d={linePath}
				fill="none"
				className={strokeClassName}
				strokeWidth="2.5"
				vectorEffect="non-scaling-stroke"
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
			<circle cx={last.x} cy={last.y} r="3" className={fillClassName} vectorEffect="non-scaling-stroke" />
		</svg>
	);
}
